package uz.unikompas.recommendation;

import java.math.BigDecimal;
import java.time.Year;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;
import uz.unikompas.careertest.CareerTestService;
import uz.unikompas.careertest.TestAttempt;
import uz.unikompas.common.dto.PageResponse;
import uz.unikompas.common.dto.Pageables;
import uz.unikompas.common.exception.ApiException;
import uz.unikompas.common.exception.ErrorCode;
import uz.unikompas.common.exception.NotFoundException;
import uz.unikompas.direction.dto.DirectionResponse;
import uz.unikompas.profile.ApplicantProfile;
import uz.unikompas.profile.ApplicantProfileRepository;
import uz.unikompas.program.PassingScore;
import uz.unikompas.program.PassingScoreRepository;
import uz.unikompas.program.Program;
import uz.unikompas.program.ProgramRepository;
import uz.unikompas.recommendation.dto.DirectionMatchResponse;
import uz.unikompas.recommendation.dto.RecommendationResponse;
import uz.unikompas.recommendation.dto.RecommendationSummaryResponse;
import uz.unikompas.recommendation.dto.RecommendedProgramResponse;
import uz.unikompas.reference.Field;
import uz.unikompas.university.dto.UniversityResponse;

/**
 * Orchestrates recommendation generation (FR-6): gathers profile, latest test, weights
 * and candidate programs, runs {@link RecommendationEngine}, persists every scored
 * program and builds the response. Reads rebuild the response from storage; deleting a
 * program cascades to its stored items (V1 FK), so a stored result may shrink over time.
 */
@Service
@RequiredArgsConstructor
public class RecommendationService {

    static final int TOP_DIRECTIONS = 10;
    static final int PER_CATEGORY = 10;
    private static final TypeReference<List<Reason>> REASONS = new TypeReference<>() {
    };

    private final ApplicantProfileRepository profiles;
    private final CareerTestService careerTests;
    private final RecommendationWeightsService weightsService;
    private final ProgramRepository programs;
    private final PassingScoreRepository passingScores;
    private final RecommendationEngine engine;
    private final RecommendationRepository recommendations;
    private final RecommendationItemRepository items;
    private final JsonMapper json;

    @Transactional
    public RecommendationResponse generate(Long userId) {
        ApplicantProfile profile = profiles.findByUserId(userId)
                .filter(ApplicantProfile::isComplete)
                .orElseThrow(() -> new ApiException(ErrorCode.PROFILE_INCOMPLETE,
                        "Region, subject pair and expected score are required"));
        Optional<TestAttempt> test = careerTests.latestAttempt(userId);
        RecommendationWeights weights = weightsService.current();
        ApplicantInput input = toInput(profile, test.orElse(null));

        List<Program> candidates = programs.findForSubjectPair(input.firstSubjectId(), input.secondSubjectId());
        Map<Long, Program> byId = candidates.stream().collect(Collectors.toMap(Program::getId, Function.identity()));
        Map<Long, List<PassingScore>> history = historyOf(candidates);
        List<ScoredProgram> scored = engine.score(input, toCandidates(candidates, history), weights,
                targetYear(history));

        Recommendation rec = recommendations.save(
                new Recommendation(userId, json.writeValueAsString(snapshot(profile, input)),
                        json.writeValueAsString(weights)));
        List<RecommendationItem> saved = new ArrayList<>(scored.size());
        for (int i = 0; i < scored.size(); i++) {
            ScoredProgram s = scored.get(i);
            saved.add(new RecommendationItem(rec, i + 1, s, json.writeValueAsString(s.reasons())));
        }
        items.saveAll(saved);
        return toResponse(rec, input.hollandCode(), profile.getExpectedScore(), weights, saved, byId);
    }

    @Transactional(readOnly = true)
    public RecommendationResponse latest(Long userId) {
        Recommendation rec = recommendations.findFirstByUserIdOrderByCreatedAtDescIdDesc(userId)
                .orElseThrow(() -> new NotFoundException("Recommendation for user", userId));
        return load(rec);
    }

    /** Only the owner can read a recommendation; others get 404 (no existence leak). */
    @Transactional(readOnly = true)
    public RecommendationResponse get(Long userId, Long id) {
        return load(recommendations.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Recommendation", id)));
    }

    @Transactional(readOnly = true)
    public PageResponse<RecommendationSummaryResponse> history(Long userId, Pageable pageable) {
        Page<Recommendation> page = recommendations.findByUserIdOrderByCreatedAtDescIdDesc(userId,
                Pageables.unsorted(pageable));
        List<Recommendation> recs = page.getContent();
        if (recs.isEmpty()) {
            return PageResponse.from(page.map(r -> (RecommendationSummaryResponse) null));
        }
        Map<Long, Map<Category, Integer>> counts = new LinkedHashMap<>();
        for (Object[] row : items.countByCategory(recs.stream().map(Recommendation::getId).toList())) {
            counts.computeIfAbsent((Long) row[0], k -> emptyCounts()).put((Category) row[1], ((Long) row[2]).intValue());
        }
        return PageResponse.from(page.map(r -> {
            Map<Category, Integer> c = counts.getOrDefault(r.getId(), emptyCounts());
            int total = c.values().stream().mapToInt(Integer::intValue).sum();
            return new RecommendationSummaryResponse(r.getId(), r.getCreatedAt(), total, c);
        }));
    }

    // ------------------------------------------------------------------ helpers

    private RecommendationResponse load(Recommendation rec) {
        List<RecommendationItem> stored = items.findByRecommendationIdOrderByRankAsc(rec.getId());
        Map<Long, Program> byId = programs.findDetailedByIds(stored.stream().map(RecommendationItem::getProgramId).toList())
                .stream().collect(Collectors.toMap(Program::getId, Function.identity()));
        InputSnapshot snap = json.readValue(rec.getInputSnapshot(), InputSnapshot.class);
        RecommendationWeights weights = json.readValue(rec.getWeights(), RecommendationWeights.class);
        return toResponse(rec, snap.hollandCode(), snap.expectedScore(), weights, stored, byId);
    }

    private RecommendationResponse toResponse(Recommendation rec, String hollandCode, BigDecimal expectedScore,
                                              RecommendationWeights weights, List<RecommendationItem> ranked,
                                              Map<Long, Program> byId) {
        Map<Category, Integer> counts = emptyCounts();
        Map<Category, List<RecommendedProgramResponse>> grouped = new EnumMap<>(Category.class);
        for (Category c : Category.values()) {
            grouped.put(c, new ArrayList<>());
        }
        for (RecommendationItem item : ranked) {
            counts.merge(item.getCategory(), 1, Integer::sum);
            List<RecommendedProgramResponse> bucket = grouped.get(item.getCategory());
            if (bucket.size() < PER_CATEGORY) {
                bucket.add(toProgram(item, byId.get(item.getProgramId())));
            }
        }

        // Best-ranked program per direction; items are already sorted by rank.
        Map<Long, List<RecommendationItem>> byDirection = new LinkedHashMap<>();
        for (RecommendationItem item : ranked) {
            byDirection.computeIfAbsent(byId.get(item.getProgramId()).getDirection().getId(), k -> new ArrayList<>())
                    .add(item);
        }
        List<DirectionMatchResponse> topDirections = byDirection.values().stream()
                .limit(TOP_DIRECTIONS)
                .map(list -> {
                    RecommendationItem best = list.getFirst();
                    Program p = byId.get(best.getProgramId());
                    return new DirectionMatchResponse(DirectionResponse.from(p.getDirection()),
                            percent(best.getTotalScore()), percent(best.getInterestScore()),
                            p.getId(), list.size());
                })
                .toList();

        return new RecommendationResponse(rec.getId(), rec.getCreatedAt(), expectedScore, hollandCode != null,
                hollandCode, weights, ranked.size(), counts, topDirections, grouped);
    }

    private RecommendedProgramResponse toProgram(RecommendationItem i, Program p) {
        return new RecommendedProgramResponse(p.getId(), i.getRank(), i.getCategory(),
                UniversityResponse.from(p.getUniversity()), DirectionResponse.from(p.getDirection()),
                p.getLanguage(), p.getStudyForm(), p.getGrantQuota(), p.getContractQuota(), p.getContractFee(),
                new RecommendedProgramResponse.Scores(i.getTotalScore(), i.getInterestScore(), i.getChanceScore(),
                        i.getPreferenceScore(), i.getRatingScore(), i.getGrantChance(), i.getContractChance()),
                i.getPredictedGrantScore(), i.getPredictedContractScore(),
                json.readValue(i.getReasons(), REASONS));
    }

    private static ApplicantInput toInput(ApplicantProfile p, TestAttempt test) {
        return new ApplicantInput(p.getExpectedScore().doubleValue(), p.getFirstSubject().getId(),
                p.getSecondSubject().getId(), p.getRegion().getId(), p.getPreferredLanguage(),
                p.getPreferredStudyForm(), p.getFinancing(), p.getMaxContractFee(), p.isWillingToRelocate(),
                p.getFields().stream().map(Field::getId).collect(Collectors.toSet()),
                test == null ? null : test.vector(), test == null ? null : test.getHollandCode());
    }

    private Map<Long, List<PassingScore>> historyOf(List<Program> list) {
        if (list.isEmpty()) {
            return Map.of();
        }
        return passingScores.findByProgramIds(list.stream().map(Program::getId).toList())
                .stream().collect(Collectors.groupingBy(s -> s.getProgram().getId()));
    }

    /** Forecast for the admission after the latest published year (current year if no data). */
    private static int targetYear(Map<Long, List<PassingScore>> history) {
        return history.values().stream().flatMap(List::stream).mapToInt(PassingScore::getYear).max()
                .orElse(Year.now().getValue() - 1) + 1;
    }

    private static List<ProgramCandidate> toCandidates(List<Program> list, Map<Long, List<PassingScore>> history) {
        return list.stream().map(p -> {
            List<PassingScore> h = history.getOrDefault(p.getId(), List.of()).stream()
                    .sorted(Comparator.comparingInt(PassingScore::getYear)).toList();
            var d = p.getDirection();
            var u = p.getUniversity();
            return new ProgramCandidate(p.getId(), d.getId(), d.getField().getId(), d.getFirstSubject().getId(),
                    d.getSecondSubject().getId(), d.riasecVector(), u.getRegion().getId(), u.getRating(),
                    p.getLanguage(), p.getStudyForm(), p.getGrantQuota(), p.getContractQuota(), p.getContractFee(),
                    known(h, PassingScore::getGrantScore), known(h, PassingScore::getContractScore));
        }).toList();
    }

    private static List<YearScore> known(List<PassingScore> history, Function<PassingScore, BigDecimal> getter) {
        return history.stream().filter(s -> getter.apply(s) != null)
                .map(s -> new YearScore(s.getYear(), getter.apply(s).doubleValue())).toList();
    }

    private static InputSnapshot snapshot(ApplicantProfile p, ApplicantInput in) {
        return new InputSnapshot(p.getExpectedScore(), in.regionId(), in.firstSubjectId(), in.secondSubjectId(),
                name(in.language()), name(in.studyForm()), in.financing().name(), in.maxContractFee(),
                in.willingToRelocate(), in.fieldIds().stream().sorted().toList(), in.riasec(), in.hollandCode());
    }

    private static String name(Enum<?> e) {
        return e == null ? null : e.name();
    }

    private static int percent(BigDecimal unit) {
        return unit.multiply(BigDecimal.valueOf(100)).setScale(0, java.math.RoundingMode.HALF_UP).intValue();
    }

    private static Map<Category, Integer> emptyCounts() {
        Map<Category, Integer> m = new EnumMap<>(Category.class);
        for (Category c : Category.values()) {
            m.put(c, 0);
        }
        return m;
    }
}

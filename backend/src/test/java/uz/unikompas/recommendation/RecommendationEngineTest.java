package uz.unikompas.recommendation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;

import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;
import uz.unikompas.profile.Financing;
import uz.unikompas.program.StudyForm;
import uz.unikompas.program.StudyLanguage;

class RecommendationEngineTest {

    private static final double[] IT_PROFILE = {5, 9, 3, 2, 3, 6};
    private static final double[] SOCIAL_PROFILE = {2, 4, 5, 10, 3, 5};
    private static final double[] INVESTIGATIVE_APPLICANT = {0.4, 0.95, 0.2, 0.1, 0.3, 0.6};

    private final RecommendationEngine engine = new RecommendationEngine();
    private final RecommendationWeights weights = RecommendationWeights.DEFAULT;

    // ------------------------------------------------------------- fixtures

    private static ApplicantInput applicant(double score) {
        return new ApplicantInput(score, 1, 2, 1, null, null, Financing.CONTRACT_OK, null, true,
                Set.of(), INVESTIGATIVE_APPLICANT, "ICR");
    }

    private static ProgramCandidate program(long id, double lastGrant) {
        return new ProgramCandidate(id, 10, 1, 1, 2, IT_PROFILE, 1, 80, StudyLanguage.UZ, StudyForm.FULL_TIME,
                20, 50, 12_000_000, List.of(lastGrant, lastGrant, lastGrant),
                List.of(lastGrant - 30, lastGrant - 30, lastGrant - 30));
    }

    private static ProgramCandidate with(ProgramCandidate p, long regionId, StudyLanguage lang, int grantQuota,
                                         long fee, double[] riasec, long fieldId) {
        return new ProgramCandidate(p.programId(), p.directionId(), fieldId, p.firstSubjectId(),
                p.secondSubjectId(), riasec, regionId, p.universityRating(), lang, p.studyForm(), grantQuota,
                p.contractQuota(), fee, p.grantHistory(), p.contractHistory());
    }

    // ------------------------------------------------------------- hard filters

    @Test
    void shouldExcludeProgramsWithDifferentSubjectPair() {
        ProgramCandidate other = new ProgramCandidate(1, 10, 1, 2, 1, IT_PROFILE, 1, 80, StudyLanguage.UZ,
                StudyForm.FULL_TIME, 20, 50, 0, List.of(140.0), List.of(110.0));
        assertThat(engine.score(applicant(150), List.of(other), weights)).isEmpty();
    }

    @Test
    void shouldRespectLanguageAndRegionPreferences() {
        ApplicantInput in = new ApplicantInput(150, 1, 2, 1, StudyLanguage.UZ, null, Financing.CONTRACT_OK, null,
                false, Set.of(), null, null);
        ProgramCandidate russian = with(program(1, 140), 1, StudyLanguage.RU, 20, 0, IT_PROFILE, 1);
        ProgramCandidate otherRegion = with(program(2, 140), 6, StudyLanguage.UZ, 20, 0, IT_PROFILE, 1);
        ProgramCandidate ok = with(program(3, 140), 1, StudyLanguage.UZ, 20, 0, IT_PROFILE, 1);
        assertThat(engine.score(in, List.of(russian, otherRegion, ok), weights))
                .extracting(s -> s.candidate().programId()).containsExactly(3L);
    }

    @Test
    void shouldExcludeContractOnlyPrograms_forGrantOnlyApplicant() {
        ApplicantInput grantOnly = new ApplicantInput(150, 1, 2, 1, null, null, Financing.GRANT_ONLY, null, true,
                Set.of(), null, null);
        ProgramCandidate noGrant = with(program(1, 140), 1, StudyLanguage.UZ, 0, 0, IT_PROFILE, 1);
        assertThat(engine.score(grantOnly, List.of(noGrant), weights)).isEmpty();
    }

    @Test
    void shouldIgnoreContractAboveBudget_butKeepGrant() {
        ApplicantInput budget = new ApplicantInput(100, 1, 2, 1, null, null, Financing.CONTRACT_OK, 5_000_000L,
                true, Set.of(), null, null);
        // Grant needs ~150 (hopeless), contract ~120 within reach but costs 12M > 5M budget.
        ProgramCandidate expensive = program(1, 150);
        assertThat(engine.score(budget, List.of(expensive), weights)).isEmpty();
    }

    // ------------------------------------------------------------- chance & categories

    @Test
    void shouldCategoriseBySafeTargetReach() {
        List<ScoredProgram> r = engine.score(applicant(150),
                List.of(grantOnlyProgram(1, 130), grantOnlyProgram(2, 150), grantOnlyProgram(3, 154),
                        grantOnlyProgram(4, 175)),
                weights);
        assertThat(r).extracting(s -> s.candidate().programId() + ":" + s.category())
                .containsExactlyInAnyOrder("1:SAFE", "2:TARGET", "3:REACH");
    }

    private static ProgramCandidate grantOnlyProgram(long id, double lastGrant) {
        return new ProgramCandidate(id, 10 + id, 1, 1, 2, IT_PROFILE, 1, 80, StudyLanguage.UZ, StudyForm.FULL_TIME,
                20, 0, 0, List.of(lastGrant, lastGrant, lastGrant), List.of());
    }

    @Test
    void shouldDiscountContractChance() {
        // Grant hopeless (needs 185), contract almost certain (needs 120) → C ≈ 0.70 · 1 → TARGET
        ProgramCandidate p = new ProgramCandidate(1, 10, 1, 1, 2, IT_PROFILE, 1, 80, StudyLanguage.UZ,
                StudyForm.FULL_TIME, 20, 50, 12_000_000, List.of(185.0, 185.0, 185.0), List.of(120.0, 120.0, 120.0));
        List<ScoredProgram> r = engine.score(applicant(150), List.of(p), weights);
        assertThat(r.getFirst().chance()).isCloseTo(0.70, within(0.01));
        assertThat(r.getFirst().category()).isEqualTo(Category.TARGET);
        assertThat(r.getFirst().grantChance()).isLessThan(0.01);
        assertThat(r.getFirst().contractChance()).isGreaterThan(0.99);
        assertThat(r.getFirst().reasons()).extracting(Reason::code).contains("BELOW_GRANT_CONTRACT_LIKELY");
    }

    // ------------------------------------------------------------- interest

    @Test
    void shouldRankMatchingInterestHigher() {
        ProgramCandidate it = with(program(1, 140), 1, StudyLanguage.UZ, 20, 0, IT_PROFILE, 1);
        ProgramCandidate social = with(program(2, 140), 1, StudyLanguage.UZ, 20, 0, SOCIAL_PROFILE, 1);
        List<ScoredProgram> r = engine.score(applicant(150), List.of(social, it), weights);
        assertThat(r.getFirst().candidate().programId()).isEqualTo(1L);
        assertThat(r.getFirst().interest()).isGreaterThan(0.9);
        assertThat(r.get(1).interest()).isLessThan(0.5);
    }

    @Test
    void shouldReturnNeutralSimilarity_forFlatVector() {
        assertThat(RecommendationEngine.interestSimilarity(new double[] {.5, .5, .5, .5, .5, .5}, IT_PROFILE))
                .isEqualTo(0.5);
        assertThat(RecommendationEngine.interestSimilarity(IT_PROFILE, IT_PROFILE)).isCloseTo(1.0, within(1e-9));
    }

    @Test
    void shouldUseSelectedFields_whenNoTestTaken() {
        ApplicantInput coldStart = new ApplicantInput(150, 1, 2, 1, null, null, Financing.CONTRACT_OK, null, true,
                Set.of(1L), null, null);
        ProgramCandidate inField = with(program(1, 140), 1, StudyLanguage.UZ, 20, 0, IT_PROFILE, 1);
        ProgramCandidate outField = with(program(2, 140), 1, StudyLanguage.UZ, 20, 0, IT_PROFILE, 6);
        List<ScoredProgram> r = engine.score(coldStart, List.of(outField, inField), weights);
        assertThat(r.getFirst().candidate().programId()).isEqualTo(1L);
        assertThat(r.getFirst().interest()).isEqualTo(1.0);
        assertThat(r.get(1).interest()).isEqualTo(0.3);
        assertThat(r.getFirst().reasons()).extracting(Reason::code).contains("FIELD_MATCH").doesNotContain("INTEREST_MATCH");
    }

    // ------------------------------------------------------------- total & explanations

    @Test
    void shouldComputeWeightedTotal() {
        ScoredProgram s = engine.score(applicant(150), List.of(program(1, 140)), weights).getFirst();
        double expected = 0.35 * s.interest() + 0.35 * s.chance() + 0.15 * s.preference() + 0.15 * s.rating();
        assertThat(s.total()).isCloseTo(expected, within(1e-12));
        assertThat(s.rating()).isEqualTo(0.8);
        assertThat(s.preference()).isEqualTo(0.6 * 1 + 0.4 * 0.5); // same region, no fields chosen
    }

    @Test
    void shouldExplainWithParameters() {
        ScoredProgram s = engine.score(applicant(150), List.of(program(1, 140)), weights).getFirst();
        assertThat(s.reasons()).extracting(Reason::code)
                .contains("INTEREST_MATCH", "ABOVE_GRANT", "SAME_REGION");
        Reason above = s.reasons().stream().filter(r -> r.code().equals("ABOVE_GRANT")).findFirst().orElseThrow();
        assertThat(above.params()).containsEntry("diff", 10.0);
        assertThat(s.predictedGrantScore()).isEqualTo(140.0);
    }

    @Test
    void shouldFlagRisingTrend() {
        ProgramCandidate rising = new ProgramCandidate(1, 10, 1, 1, 2, IT_PROFILE, 1, 80, StudyLanguage.UZ,
                StudyForm.FULL_TIME, 20, 0, 0, List.of(130.0, 135.0, 140.0), List.of());
        ScoredProgram s = engine.score(applicant(160), List.of(rising), weights).getFirst();
        assertThat(s.predictedGrantScore()).isEqualTo(145.0);
        assertThat(s.reasons()).extracting(Reason::code).contains("RISING_TREND");
    }

    @Test
    void shouldBeDeterministic() {
        List<ProgramCandidate> list = List.of(program(1, 140), program(2, 140), program(3, 145));
        assertThat(engine.score(applicant(150), list, weights))
                .extracting(s -> s.candidate().programId())
                .isEqualTo(engine.score(applicant(150), list, weights).stream()
                        .map(s -> s.candidate().programId()).toList());
    }

    @Test
    void shouldRejectInvalidWeights() {
        assertThatThrownBy(() -> new RecommendationWeights(0.5, 0.5, 0.5, 0)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new RecommendationWeights(-0.1, 0.6, 0.3, 0.2)).isInstanceOf(IllegalArgumentException.class);
    }
}

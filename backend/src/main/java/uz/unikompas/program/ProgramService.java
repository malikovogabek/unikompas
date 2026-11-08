package uz.unikompas.program;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.unikompas.common.dto.PageResponse;
import uz.unikompas.common.dto.Pageables;
import uz.unikompas.common.exception.ApiException;
import uz.unikompas.common.exception.ErrorCode;
import uz.unikompas.common.exception.NotFoundException;
import uz.unikompas.direction.DirectionRepository;
import uz.unikompas.program.dto.ProgramResponse;
import uz.unikompas.program.dto.ScoreHistoryItem;
import uz.unikompas.university.UniversityRepository;

/**
 * Read side of admission programs (FR-5.5, FR-7.2). Every method issues two
 * queries at most: programs with their joins, then all score histories at once.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProgramService {

    static final int COMPARE_MIN = 2;
    static final int COMPARE_MAX = 4;

    private final ProgramRepository programs;
    private final PassingScoreRepository scores;
    private final UniversityRepository universities;
    private final DirectionRepository directions;

    /** Programs of a university; order is fixed by the query, client sort is ignored. */
    public PageResponse<ProgramResponse> byUniversity(Long universityId, Pageable pageable) {
        if (!universities.existsById(universityId)) {
            throw new NotFoundException("University", universityId);
        }
        return toPage(programs.findByUniversity(universityId, Pageables.unsorted(pageable)));
    }

    /** Programs of a direction, best-rated universities first. */
    public PageResponse<ProgramResponse> byDirection(Long directionId, Pageable pageable) {
        if (!directions.existsById(directionId)) {
            throw new NotFoundException("Direction", directionId);
        }
        return toPage(programs.findByDirection(directionId, Pageables.unsorted(pageable)));
    }

    public ProgramResponse get(Long id) {
        Program program = programs.findDetailedById(id).orElseThrow(() -> new NotFoundException("Program", id));
        return withHistory(List.of(program)).getFirst();
    }

    /** Returns 2–4 distinct programs in the requested order. */
    public List<ProgramResponse> compare(List<Long> ids) {
        if (ids.contains(null)) {
            throw new ApiException(ErrorCode.VALIDATION_ERROR, "Program ids must not be empty");
        }
        Set<Long> unique = new LinkedHashSet<>(ids);
        if (unique.size() < COMPARE_MIN || unique.size() > COMPARE_MAX) {
            throw new ApiException(ErrorCode.VALIDATION_ERROR,
                    "Compare requires %d to %d distinct program ids".formatted(COMPARE_MIN, COMPARE_MAX));
        }
        List<ProgramResponse> result = listInOrder(List.copyOf(unique));
        if (result.size() != unique.size()) {
            Set<Long> found = result.stream().map(ProgramResponse::id).collect(Collectors.toSet());
            Long missing = unique.stream().filter(id -> !found.contains(id)).findFirst().orElseThrow();
            throw new NotFoundException("Program", missing);
        }
        return result;
    }

    /** Programs with history in the given order; unknown ids are skipped. */
    public List<ProgramResponse> listInOrder(List<Long> ids) {
        if (ids.isEmpty()) {
            return List.of();
        }
        Map<Long, Program> found = programs.findDetailedByIds(ids).stream()
                .collect(Collectors.toMap(Program::getId, Function.identity()));
        return withHistory(ids.stream().filter(found::containsKey).map(found::get).toList());
    }

    private PageResponse<ProgramResponse> toPage(Page<Program> page) {
        List<ProgramResponse> content = withHistory(page.getContent());
        return new PageResponse<>(content, page.getNumber(), page.getSize(), page.getTotalElements(),
                page.getTotalPages());
    }

    private List<ProgramResponse> withHistory(List<Program> list) {
        if (list.isEmpty()) {
            return List.of();
        }
        Map<Long, List<ScoreHistoryItem>> history = scores.findByProgramIds(list.stream().map(Program::getId).toList())
                .stream()
                .collect(Collectors.groupingBy(s -> s.getProgram().getId(),
                        Collectors.mapping(ScoreHistoryItem::from, Collectors.toList())));
        return list.stream().map(p -> ProgramResponse.from(p, history.getOrDefault(p.getId(), List.of()))).toList();
    }
}

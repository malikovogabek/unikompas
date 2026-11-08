package uz.unikompas.program;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

    public List<ProgramResponse> byUniversity(Long universityId) {
        if (!universities.existsById(universityId)) {
            throw new NotFoundException("University", universityId);
        }
        return withHistory(programs.findByUniversity(universityId));
    }

    public List<ProgramResponse> byDirection(Long directionId) {
        if (!directions.existsById(directionId)) {
            throw new NotFoundException("Direction", directionId);
        }
        return withHistory(programs.findByDirection(directionId));
    }

    public ProgramResponse get(Long id) {
        Program program = programs.findDetailedById(id).orElseThrow(() -> new NotFoundException("Program", id));
        return withHistory(List.of(program)).getFirst();
    }

    /** Returns 2–4 distinct programs in the requested order. */
    public List<ProgramResponse> compare(List<Long> ids) {
        Set<Long> unique = new LinkedHashSet<>(ids);
        if (unique.size() < COMPARE_MIN || unique.size() > COMPARE_MAX) {
            throw new ApiException(ErrorCode.VALIDATION_ERROR,
                    "Compare requires %d to %d distinct program ids".formatted(COMPARE_MIN, COMPARE_MAX));
        }
        Map<Long, Program> found = programs.findDetailedByIds(unique).stream()
                .collect(Collectors.toMap(Program::getId, Function.identity()));
        unique.stream().filter(id -> !found.containsKey(id)).findFirst().ifPresent(id -> {
            throw new NotFoundException("Program", id);
        });
        return withHistory(unique.stream().map(found::get).toList());
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

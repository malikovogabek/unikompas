package uz.unikompas.program;

import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.unikompas.common.dto.PageResponse;
import uz.unikompas.common.dto.Pageables;
import uz.unikompas.common.exception.FieldValidationException;
import uz.unikompas.common.exception.NotFoundException;
import uz.unikompas.direction.Direction;
import uz.unikompas.direction.DirectionRepository;
import uz.unikompas.program.dto.PassingScoreRequest;
import uz.unikompas.program.dto.ProgramRequest;
import uz.unikompas.program.dto.ProgramResponse;
import uz.unikompas.university.University;
import uz.unikompas.university.UniversityRepository;

/**
 * Write side of programs and their passing scores (FR-8.3, FR-8.4).
 */
@Service
@RequiredArgsConstructor
public class ProgramAdminService {

    private final ProgramRepository programs;
    private final PassingScoreRepository scores;
    private final UniversityRepository universities;
    private final DirectionRepository directions;
    private final ProgramService programService;

    /** Admin list with optional university / direction filters. */
    @Transactional(readOnly = true)
    public PageResponse<ProgramResponse> list(Long universityId, Long directionId, Pageable pageable) {
        Page<Program> page = programs.findForAdmin(universityId, directionId, Pageables.unsorted(pageable));
        List<ProgramResponse> content = programService.listInOrder(page.map(Program::getId).getContent());
        return new PageResponse<>(content, page.getNumber(), page.getSize(), page.getTotalElements(),
                page.getTotalPages());
    }

    @Transactional
    public ProgramResponse create(ProgramRequest req) {
        Program p = apply(new Program(), req);
        Long id = programs.saveAndFlush(p).getId();
        return programService.get(id);
    }

    @Transactional
    public ProgramResponse update(Long id, ProgramRequest req) {
        Program p = programs.findById(id).orElseThrow(() -> new NotFoundException("Program", id));
        apply(p, req);
        programs.flush();
        return programService.get(id);
    }

    @Transactional
    public void delete(Long id) {
        if (!programs.existsById(id)) {
            throw new NotFoundException("Program", id);
        }
        programs.deleteById(id);
    }

    /**
     * Replaces the program's whole score history with the given years (PUT semantics):
     * listed years are inserted or updated, years not listed are removed.
     */
    @Transactional
    public ProgramResponse replaceScores(Long programId, List<PassingScoreRequest> years) {
        Program program = programs.findById(programId).orElseThrow(() -> new NotFoundException("Program", programId));
        Set<Integer> seen = new HashSet<>();
        for (PassingScoreRequest y : years) {
            if (!seen.add(y.year())) {
                throw FieldValidationException.of("year", "Duplicate");
            }
        }
        Map<Integer, PassingScore> existing = new LinkedHashMap<>();
        scores.findByProgramIds(List.of(programId)).forEach(s -> existing.put((int) s.getYear(), s));
        existing.forEach((year, s) -> {
            if (!seen.contains(year)) {
                scores.delete(s);
            }
        });
        for (PassingScoreRequest y : years) {
            PassingScore s = existing.computeIfAbsent(y.year(), k -> {
                PassingScore created = new PassingScore();
                created.setProgram(program);
                created.setYear(y.year().shortValue());
                return created;
            });
            s.setGrantScore(y.grantScore());
            s.setContractScore(y.contractScore());
            scores.save(s);
        }
        scores.flush();
        return programService.get(programId);
    }

    private Program apply(Program p, ProgramRequest req) {
        Map<String, String> errors = new LinkedHashMap<>();
        University u = universities.findById(req.universityId()).orElse(null);
        Direction d = directions.findById(req.directionId()).orElse(null);
        if (u == null) {
            errors.put("universityId", "Exists");
        }
        if (d == null) {
            errors.put("directionId", "Exists");
        }
        if (errors.isEmpty()) {
            programs.findOffer(req.universityId(), req.directionId(), req.language(), req.studyForm())
                    .filter(other -> !other.getId().equals(p.getId()))
                    .ifPresent(other -> errors.put("studyForm", "Unique"));
        }
        if (!errors.isEmpty()) {
            throw new FieldValidationException(errors);
        }
        p.setUniversity(u);
        p.setDirection(d);
        p.setLanguage(req.language());
        p.setStudyForm(req.studyForm());
        p.setGrantQuota(req.grantQuota());
        p.setContractQuota(req.contractQuota());
        p.setContractFee(req.contractFee());
        p.setDurationYears(req.durationYears().shortValue());
        return p;
    }
}

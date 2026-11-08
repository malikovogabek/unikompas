package uz.unikompas.direction;

import java.util.LinkedHashMap;
import java.util.Map;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.unikompas.common.dto.PageResponse;
import uz.unikompas.common.dto.Pageables;
import uz.unikompas.common.exception.FieldValidationException;
import uz.unikompas.common.exception.NotFoundException;
import uz.unikompas.direction.dto.DirectionDetailsResponse;
import uz.unikompas.direction.dto.DirectionRequest;
import uz.unikompas.direction.dto.DirectionResponse;
import uz.unikompas.program.ProgramRepository;
import uz.unikompas.reference.FieldRepository;
import uz.unikompas.reference.SubjectRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DirectionService {

    private final DirectionRepository directions;
    private final ProgramRepository programs;
    private final FieldRepository fields;
    private final SubjectRepository subjects;

    public PageResponse<DirectionResponse> search(String search, Long fieldId, Long subjectId1, Long subjectId2,
                                                  Pageable pageable) {
        Specification<Direction> spec = Specification.allOf(
                DirectionSpecs.nameOrCodeContains(search),
                DirectionSpecs.inField(fieldId),
                DirectionSpecs.firstSubject(subjectId1),
                DirectionSpecs.secondSubject(subjectId2));
        return PageResponse.from(directions.findAll(spec, Pageables.withIdTiebreaker(pageable))
                .map(DirectionResponse::from));
    }

    public DirectionDetailsResponse get(Long id) {
        Direction d = directions.findDetailedById(id).orElseThrow(() -> new NotFoundException("Direction", id));
        return DirectionDetailsResponse.from(d, programs.countByDirectionId(id));
    }

    @Transactional
    public DirectionDetailsResponse create(DirectionRequest req) {
        Direction d = apply(new Direction(), req);
        return DirectionDetailsResponse.from(directions.save(d), 0);
    }

    @Transactional
    public DirectionDetailsResponse update(Long id, DirectionRequest req) {
        Direction d = directions.findDetailedById(id).orElseThrow(() -> new NotFoundException("Direction", id));
        apply(d, req);
        return DirectionDetailsResponse.from(d, programs.countByDirectionId(id));
    }

    /** Deletes the direction and its programs (FK cascade). */
    @Transactional
    public void delete(Long id) {
        if (!directions.existsById(id)) {
            throw new NotFoundException("Direction", id);
        }
        directions.deleteById(id);
    }

    private Direction apply(Direction d, DirectionRequest req) {
        Map<String, String> errors = new LinkedHashMap<>();
        String code = req.code().trim();
        directions.findByCode(code).filter(other -> !other.getId().equals(d.getId()))
                .ifPresent(other -> errors.put("code", "Unique"));
        var field = fields.findById(req.fieldId());
        var first = subjects.findById(req.firstSubjectId());
        var second = subjects.findById(req.secondSubjectId());
        if (field.isEmpty()) {
            errors.put("fieldId", "Exists");
        }
        if (first.isEmpty()) {
            errors.put("firstSubjectId", "Exists");
        }
        if (second.isEmpty()) {
            errors.put("secondSubjectId", "Exists");
        } else if (req.firstSubjectId().equals(req.secondSubjectId())) {
            errors.put("secondSubjectId", "DistinctSubjects");
        }
        if (!errors.isEmpty()) {
            throw new FieldValidationException(errors);
        }
        d.setCode(code);
        d.setName(req.name().trim());
        d.setField(field.get());
        d.setFirstSubject(first.get());
        d.setSecondSubject(second.get());
        var r = req.riasec();
        d.setRiasecR(r.r().shortValue());
        d.setRiasecI(r.i().shortValue());
        d.setRiasecA(r.a().shortValue());
        d.setRiasecS(r.s().shortValue());
        d.setRiasecE(r.e().shortValue());
        d.setRiasecC(r.c().shortValue());
        d.setDescription(req.description());
        d.setCareerProspects(req.careerProspects());
        return d;
    }
}

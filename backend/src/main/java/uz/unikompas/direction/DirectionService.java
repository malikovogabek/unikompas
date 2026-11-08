package uz.unikompas.direction;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.unikompas.common.dto.PageResponse;
import uz.unikompas.common.exception.NotFoundException;
import uz.unikompas.direction.dto.DirectionDetailsResponse;
import uz.unikompas.direction.dto.DirectionResponse;
import uz.unikompas.program.ProgramRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DirectionService {

    private final DirectionRepository directions;
    private final ProgramRepository programs;

    public PageResponse<DirectionResponse> search(String search, Long fieldId, Long subjectId1, Long subjectId2,
                                                  Pageable pageable) {
        Specification<Direction> spec = Specification.allOf(
                DirectionSpecs.nameOrCodeContains(search),
                DirectionSpecs.inField(fieldId),
                DirectionSpecs.firstSubject(subjectId1),
                DirectionSpecs.secondSubject(subjectId2));
        return PageResponse.from(directions.findAll(spec, pageable).map(DirectionResponse::from));
    }

    public DirectionDetailsResponse get(Long id) {
        Direction d = directions.findDetailedById(id).orElseThrow(() -> new NotFoundException("Direction", id));
        return DirectionDetailsResponse.from(d, programs.countByDirectionId(id));
    }
}

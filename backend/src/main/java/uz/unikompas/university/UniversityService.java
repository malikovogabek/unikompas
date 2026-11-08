package uz.unikompas.university;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.unikompas.common.dto.PageResponse;
import uz.unikompas.common.exception.NotFoundException;
import uz.unikompas.program.ProgramRepository;
import uz.unikompas.university.dto.UniversityDetailsResponse;
import uz.unikompas.university.dto.UniversityResponse;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UniversityService {

    private final UniversityRepository universities;
    private final ProgramRepository programs;

    public PageResponse<UniversityResponse> search(String search, Long regionId, UniversityType type, Pageable pageable) {
        Specification<University> spec = Specification.allOf(
                UniversitySpecs.nameContains(search),
                UniversitySpecs.inRegion(regionId),
                UniversitySpecs.ofType(type));
        return PageResponse.from(universities.findAll(spec, pageable).map(UniversityResponse::from));
    }

    public UniversityDetailsResponse get(Long id) {
        University u = universities.findWithRegionById(id).orElseThrow(() -> new NotFoundException("University", id));
        return UniversityDetailsResponse.from(u, programs.countByUniversityId(id));
    }
}

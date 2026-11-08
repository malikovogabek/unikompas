package uz.unikompas.university;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.unikompas.common.dto.PageResponse;
import uz.unikompas.common.dto.Pageables;
import uz.unikompas.common.exception.FieldValidationException;
import uz.unikompas.common.exception.NotFoundException;
import uz.unikompas.program.ProgramRepository;
import uz.unikompas.reference.RegionRepository;
import uz.unikompas.university.dto.UniversityDetailsResponse;
import uz.unikompas.university.dto.UniversityRequest;
import uz.unikompas.university.dto.UniversityResponse;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UniversityService {

    private final UniversityRepository universities;
    private final ProgramRepository programs;
    private final RegionRepository regions;

    public PageResponse<UniversityResponse> search(String search, Long regionId, UniversityType type, Pageable pageable) {
        Specification<University> spec = Specification.allOf(
                UniversitySpecs.nameContains(search),
                UniversitySpecs.inRegion(regionId),
                UniversitySpecs.ofType(type));
        return PageResponse.from(universities.findAll(spec, Pageables.withIdTiebreaker(pageable))
                .map(UniversityResponse::from));
    }

    public UniversityDetailsResponse get(Long id) {
        University u = universities.findWithRegionById(id).orElseThrow(() -> new NotFoundException("University", id));
        return UniversityDetailsResponse.from(u, programs.countByUniversityId(id));
    }

    @Transactional
    public UniversityDetailsResponse create(UniversityRequest req) {
        University u = apply(new University(), req);
        return UniversityDetailsResponse.from(universities.save(u), 0);
    }

    @Transactional
    public UniversityDetailsResponse update(Long id, UniversityRequest req) {
        University u = universities.findWithRegionById(id).orElseThrow(() -> new NotFoundException("University", id));
        apply(u, req);
        return UniversityDetailsResponse.from(u, programs.countByUniversityId(id));
    }

    /** Deletes the university together with its programs, scores and favorites (FK cascade). */
    @Transactional
    public void delete(Long id) {
        if (!universities.existsById(id)) {
            throw new NotFoundException("University", id);
        }
        universities.deleteById(id);
    }

    private University apply(University u, UniversityRequest req) {
        u.setRegion(regions.findById(req.regionId())
                .orElseThrow(() -> FieldValidationException.of("regionId", "Exists")));
        u.setName(req.name().trim());
        u.setShortName(blankToNull(req.shortName()));
        u.setCity(blankToNull(req.city()));
        u.setAddress(blankToNull(req.address()));
        u.setWebsite(blankToNull(req.website()));
        u.setType(req.type());
        u.setRating(req.rating().shortValue());
        u.setHasDormitory(req.hasDormitory());
        u.setFoundedYear(req.foundedYear() == null ? null : req.foundedYear().shortValue());
        u.setDescription(blankToNull(req.description()));
        u.setLogoUrl(blankToNull(req.logoUrl()));
        return u;
    }

    static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}

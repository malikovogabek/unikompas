package uz.unikompas.university;

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

    /**
     * Deletes the university together with its programs, scores, favorites and the matching
     * items of saved recommendations (FK cascade; input/weight snapshots are kept).
     */
    @Transactional
    public void delete(Long id) {
        if (!universities.existsById(id)) {
            throw new NotFoundException("University", id);
        }
        universities.deleteById(id);
    }

    private University apply(University u, UniversityRequest req) {
        Map<String, String> errors = new LinkedHashMap<>();
        var region = regions.findById(req.regionId());
        if (region.isEmpty()) {
            errors.put("regionId", "Exists");
        }
        String shortName = blankToNull(req.shortName());
        // Short names identify universities in the CSV import, so they must be unique (also V7 index).
        if (shortName != null) {
            universities.findByShortNameIgnoreCase(shortName).filter(other -> !other.getId().equals(u.getId()))
                    .ifPresent(other -> errors.put("shortName", "Unique"));
        }
        if (!errors.isEmpty()) {
            throw new FieldValidationException(errors);
        }
        u.setRegion(region.get());
        u.setName(req.name().trim());
        u.setShortName(shortName);
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

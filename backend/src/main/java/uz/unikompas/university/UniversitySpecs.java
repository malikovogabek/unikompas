package uz.unikompas.university;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;
import uz.unikompas.common.persistence.Specs;

/**
 * Optional catalog filters (FR-5.1). Each returns {@link Specification#unrestricted()}
 * when the parameter is absent.
 */
final class UniversitySpecs {

    private UniversitySpecs() {
    }

    static Specification<University> nameContains(String search) {
        if (!StringUtils.hasText(search)) {
            return Specification.unrestricted();
        }
        return (root, q, cb) -> cb.or(
                Specs.containsIgnoreCase(cb, root.get("name"), search),
                Specs.containsIgnoreCase(cb, root.get("shortName"), search));
    }

    static Specification<University> inRegion(Long regionId) {
        return regionId == null ? Specification.unrestricted()
                : (root, q, cb) -> cb.equal(root.get("region").get("id"), regionId);
    }

    static Specification<University> ofType(UniversityType type) {
        return type == null ? Specification.unrestricted() : (root, q, cb) -> cb.equal(root.get("type"), type);
    }
}

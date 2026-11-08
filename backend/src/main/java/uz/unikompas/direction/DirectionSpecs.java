package uz.unikompas.direction;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;
import uz.unikompas.common.persistence.Specs;

/**
 * Optional direction filters (FR-5.3). The subject pair is ordered: the first
 * subject carries the higher weight at the exam, so (Math, Physics) ≠ (Physics, Math).
 */
final class DirectionSpecs {

    private DirectionSpecs() {
    }

    static Specification<Direction> nameOrCodeContains(String search) {
        if (!StringUtils.hasText(search)) {
            return Specification.unrestricted();
        }
        return (root, q, cb) -> cb.or(
                Specs.containsIgnoreCase(cb, root.get("name"), search),
                Specs.containsIgnoreCase(cb, root.get("code"), search));
    }

    static Specification<Direction> inField(Long fieldId) {
        return fieldId == null ? Specification.unrestricted()
                : (root, q, cb) -> cb.equal(root.get("field").get("id"), fieldId);
    }

    static Specification<Direction> firstSubject(Long subjectId) {
        return subjectId == null ? Specification.unrestricted()
                : (root, q, cb) -> cb.equal(root.get("firstSubject").get("id"), subjectId);
    }

    static Specification<Direction> secondSubject(Long subjectId) {
        return subjectId == null ? Specification.unrestricted()
                : (root, q, cb) -> cb.equal(root.get("secondSubject").get("id"), subjectId);
    }
}

package uz.unikompas.direction;

import java.util.Locale;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

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
        String pattern = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
        return (root, q, cb) -> cb.or(
                cb.like(cb.lower(root.get("name")), pattern),
                cb.like(root.get("code"), pattern));
    }

    static Specification<Direction> inField(Long fieldId) {
        return fieldId == null ? Specification.unrestricted() : (root, q, cb) -> cb.equal(root.get("field").get("id"), fieldId);
    }

    static Specification<Direction> firstSubject(Long subjectId) {
        return subjectId == null ? Specification.unrestricted() : (root, q, cb) -> cb.equal(root.get("firstSubject").get("id"), subjectId);
    }

    static Specification<Direction> secondSubject(Long subjectId) {
        return subjectId == null ? Specification.unrestricted() : (root, q, cb) -> cb.equal(root.get("secondSubject").get("id"), subjectId);
    }
}

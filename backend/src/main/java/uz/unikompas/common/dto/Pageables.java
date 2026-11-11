package uz.unikompas.common.dto;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * Pagination helpers.
 */
public final class Pageables {

    private Pageables() {
    }

    /**
     * Appends {@code id ASC} as a unique tiebreaker and sorts NULLs last, so rows with equal sort keys
     * (e.g. two universities rated 86) never repeat or vanish between pages.
     */
    public static Pageable withIdTiebreaker(Pageable pageable) {
        // NULLs go last in every direction (PostgreSQL puts them first on DESC by default), so
        // e.g. "recently active" lists never start with users who were never seen.
        Sort sort = Sort.by(pageable.getSort().stream().map(Sort.Order::nullsLast).toList());
        if (sort.getOrderFor("id") == null) {
            sort = sort.and(Sort.by("id"));
        }
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
    }

    /** Keeps page number and size but drops client sorting (for queries with a fixed ORDER BY). */
    public static Pageable unsorted(Pageable pageable) {
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
    }
}

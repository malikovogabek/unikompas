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
     * Appends {@code id ASC} as a unique tiebreaker, so rows with equal sort keys
     * (e.g. two universities rated 86) never repeat or vanish between pages.
     */
    public static Pageable withIdTiebreaker(Pageable pageable) {
        Sort sort = pageable.getSort();
        if (sort.getOrderFor("id") != null) {
            return pageable;
        }
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort.and(Sort.by("id")));
    }

    /** Keeps page number and size but drops client sorting (for queries with a fixed ORDER BY). */
    public static Pageable unsorted(Pageable pageable) {
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
    }
}

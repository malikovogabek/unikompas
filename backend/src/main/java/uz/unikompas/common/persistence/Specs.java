package uz.unikompas.common.persistence;

import java.util.Locale;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;

/**
 * Shared Criteria helpers for catalog search.
 */
public final class Specs {

    private static final char ESCAPE = '\\';

    private Specs() {
    }

    /**
     * Case-insensitive "contains" that treats user input literally:
     * {@code %}, {@code _} and {@code \} are escaped, so {@code search=%} does not match everything.
     */
    public static Predicate containsIgnoreCase(CriteriaBuilder cb, Expression<String> expr, String search) {
        return cb.like(cb.lower(expr), likePattern(search), ESCAPE);
    }

    static String likePattern(String search) {
        String escaped = search.trim().toLowerCase(Locale.ROOT)
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
        return "%" + escaped + "%";
    }
}

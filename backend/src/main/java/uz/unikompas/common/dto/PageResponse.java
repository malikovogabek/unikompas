package uz.unikompas.common.dto;

import java.util.List;

import org.springframework.data.domain.Page;

/**
 * Stable pagination envelope so the API does not leak Spring's {@code Page} JSON shape.
 */
public record PageResponse<T>(List<T> content, int page, int size, long totalElements, int totalPages) {

    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }
}

package uz.unikompas.admin.dto;

import java.util.List;

/** Admin dashboard data (FR-8.7). */
public record StatsResponse(
        long applicants, long completeProfiles, long testAttempts, long applicantsWithTest, long recommendations,
        Catalog catalog, List<Ranked> topDirections, List<Ranked> topUniversities, List<Ranked> applicantsByRegion) {

    public record Catalog(long universities, long directions, long programs) {
    }

    /** {@code code} is a stable key (direction code, region code or university short name). */
    public record Ranked(Long id, String code, String name, long count) {
    }
}

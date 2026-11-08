package uz.unikompas.recommendation.dto;

import java.time.Instant;
import java.util.Map;

import uz.unikompas.recommendation.Category;

/** History row: when it was generated and how many matches per category. */
public record RecommendationSummaryResponse(Long id, Instant createdAt, int totalMatches, Map<Category, Integer> counts) {
}

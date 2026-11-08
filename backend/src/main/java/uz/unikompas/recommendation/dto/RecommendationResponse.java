package uz.unikompas.recommendation.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

import uz.unikompas.recommendation.Category;
import uz.unikompas.recommendation.RecommendationWeights;

/**
 * Full recommendation (FR-6.1–6.4). {@code programs} holds up to 10 per category;
 * {@code counts} holds the total number of matches per category.
 */
public record RecommendationResponse(
        Long id, Instant createdAt, BigDecimal expectedScore, boolean usedCareerTest, String hollandCode,
        RecommendationWeights weights, int totalMatches, Map<Category, Integer> counts,
        List<DirectionMatchResponse> topDirections, Map<Category, List<RecommendedProgramResponse>> programs) {
}

package uz.unikompas.recommendation.dto;

import uz.unikompas.direction.dto.DirectionResponse;

/**
 * A recommended direction (FR-6.2): its best program's total score as a percentage,
 * the interest match and how many suitable programs exist.
 */
public record DirectionMatchResponse(
        DirectionResponse direction, int matchPercent, int interestPercent, Long bestProgramId, int programCount) {
}

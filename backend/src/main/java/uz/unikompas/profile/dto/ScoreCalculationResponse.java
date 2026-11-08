package uz.unikompas.profile.dto;

import java.math.BigDecimal;

/**
 * Score breakdown per block with each block's maximum, and the total out of {@code maxTotal} (189).
 * Maximums are returned so clients never duplicate the admission formula.
 */
public record ScoreCalculationResponse(
        BigDecimal mandatoryScore, BigDecimal firstSubjectScore, BigDecimal secondSubjectScore,
        BigDecimal mandatoryMax, BigDecimal firstSubjectMax, BigDecimal secondSubjectMax,
        BigDecimal total, BigDecimal maxTotal) {
}

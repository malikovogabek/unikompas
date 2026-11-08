package uz.unikompas.profile.dto;

import java.math.BigDecimal;

/** Score breakdown per block and the total out of {@code maxTotal} (189). */
public record ScoreCalculationResponse(
        BigDecimal mandatoryScore, BigDecimal firstSubjectScore, BigDecimal secondSubjectScore,
        BigDecimal total, BigDecimal maxTotal) {
}

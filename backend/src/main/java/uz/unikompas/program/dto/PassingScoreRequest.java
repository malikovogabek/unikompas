package uz.unikompas.program.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/** One year of passing scores; a {@code null} score means no places of that type that year. */
public record PassingScoreRequest(
        @NotNull @Min(2000) @Max(2100) Integer year,
        @DecimalMin("0.0") @DecimalMax("189.0") @Digits(integer = 3, fraction = 1) BigDecimal grantScore,
        @DecimalMin("0.0") @DecimalMax("189.0") @Digits(integer = 3, fraction = 1) BigDecimal contractScore) {
}

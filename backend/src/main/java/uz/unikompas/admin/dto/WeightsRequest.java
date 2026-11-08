package uz.unikompas.admin.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

/** New algorithm weights; each 0..1 and together exactly 1 (±0.001). */
public record WeightsRequest(
        @NotNull @DecimalMin("0") @DecimalMax("1") Double interest,
        @NotNull @DecimalMin("0") @DecimalMax("1") Double chance,
        @NotNull @DecimalMin("0") @DecimalMax("1") Double preference,
        @NotNull @DecimalMin("0") @DecimalMax("1") Double rating) {
}

package uz.unikompas.profile.dto;

import java.math.BigDecimal;
import java.util.Set;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import uz.unikompas.profile.Financing;
import uz.unikompas.program.StudyForm;
import uz.unikompas.program.StudyLanguage;

/**
 * Full profile replacement (PUT semantics). Optional preferences ({@code null}) mean "any".
 */
public record ProfileUpdateRequest(
        @Schema(example = "1") @NotNull Long regionId,
        @Schema(description = "1-mutaxassislik fani", example = "1") @NotNull Long firstSubjectId,
        @Schema(description = "2-mutaxassislik fani", example = "2") @NotNull Long secondSubjectId,
        @Schema(description = "Kutilayotgan bal, 0–189", example = "150.5")
        @NotNull @DecimalMin("0.0") @DecimalMax("189.0") @Digits(integer = 3, fraction = 1) BigDecimal expectedScore,
        @Schema(description = "null — farqi yo‘q") StudyLanguage preferredLanguage,
        @Schema(description = "null — farqi yo‘q") StudyForm preferredStudyForm,
        @NotNull Financing financing,
        @Schema(description = "Yillik kontrakt uchun maksimal summa (so‘m); null — cheklovsiz", example = "15000000")
        @PositiveOrZero Long maxContractFee,
        @NotNull Boolean willingToRelocate,
        @Schema(description = "Qiziqish sohalari id’lari (ko‘pi bilan 5 ta)")
        @Size(max = 5) Set<@NotNull Long> fieldIds) {
}

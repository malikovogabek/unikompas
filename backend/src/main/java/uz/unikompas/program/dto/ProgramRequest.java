package uz.unikompas.program.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import uz.unikompas.program.StudyForm;
import uz.unikompas.program.StudyLanguage;

/** Create/replace payload for an admission program (admin, FR-8.3). */
public record ProgramRequest(
        @NotNull Long universityId,
        @NotNull Long directionId,
        @NotNull StudyLanguage language,
        @NotNull StudyForm studyForm,
        @NotNull @PositiveOrZero Integer grantQuota,
        @NotNull @PositiveOrZero Integer contractQuota,
        @Schema(description = "Yillik kontrakt narxi, so‘m", example = "14500000") @NotNull @PositiveOrZero Long contractFee,
        @NotNull @Min(1) @Max(7) Integer durationYears) {
}

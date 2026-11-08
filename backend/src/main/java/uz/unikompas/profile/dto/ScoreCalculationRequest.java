package uz.unikompas.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/** Number of correct answers per test block (30 questions each). */
public record ScoreCalculationRequest(
        @Schema(description = "Majburiy fanlar (ona tili, matematika, tarix) — jami to‘g‘ri javoblar", example = "24")
        @NotNull @Min(0) @Max(30) Integer mandatoryCorrect,
        @Schema(description = "1-mutaxassislik fani to‘g‘ri javoblari", example = "26")
        @NotNull @Min(0) @Max(30) Integer firstSubjectCorrect,
        @Schema(description = "2-mutaxassislik fani to‘g‘ri javoblari", example = "22")
        @NotNull @Min(0) @Max(30) Integer secondSubjectCorrect) {
}

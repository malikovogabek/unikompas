package uz.unikompas.direction.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Create/replace payload for a study direction (admin, FR-8.2). */
public record DirectionRequest(
        @Schema(description = "Klassifikator kodi", example = "60610100") @NotBlank @Pattern(regexp = "^\\d{6,12}$")
        String code,
        @NotBlank @Size(max = 200) String name,
        @NotNull Long fieldId,
        @NotNull Long firstSubjectId,
        @NotNull Long secondSubjectId,
        @Schema(description = "RIASEC profili, har biri 0–10") @NotNull @Valid Riasec riasec,
        @Size(max = 5000) String description,
        @Size(max = 5000) String careerProspects) {

    public record Riasec(
            @NotNull @Min(0) @Max(10) Integer r, @NotNull @Min(0) @Max(10) Integer i,
            @NotNull @Min(0) @Max(10) Integer a, @NotNull @Min(0) @Max(10) Integer s,
            @NotNull @Min(0) @Max(10) Integer e, @NotNull @Min(0) @Max(10) Integer c) {
    }
}

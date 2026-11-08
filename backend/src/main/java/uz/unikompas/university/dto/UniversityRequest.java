package uz.unikompas.university.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import uz.unikompas.university.UniversityType;

/** Create/replace payload for a university (admin, FR-8.1). Empty optional strings mean "not set". */
public record UniversityRequest(
        @Schema(example = "Toshkent axborot texnologiyalari universiteti") @NotBlank @Size(max = 200) String name,
        @Schema(example = "TATU") @Size(max = 40) String shortName,
        @NotNull Long regionId,
        @Size(max = 80) String city,
        @Size(max = 250) String address,
        @Schema(example = "https://tuit.uz") @Size(max = 200) @Pattern(regexp = "^$|^https?://\\S+$") String website,
        @NotNull UniversityType type,
        @NotNull @Min(0) @Max(100) Integer rating,
        @NotNull Boolean hasDormitory,
        @Min(1800) @Max(2100) Integer foundedYear,
        @Size(max = 5000) String description,
        @Size(max = 300) @Pattern(regexp = "^$|^https?://\\S+$") String logoUrl) {
}

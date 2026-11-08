package uz.unikompas.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import uz.unikompas.common.validation.MaxBytes;

/**
 * Applicant sign-up payload. Password: 8–72 chars (and ≤ 72 UTF-8 bytes — BCrypt's limit)
 * with at least one letter and one digit. Inputs are only trimmed here so that
 * {@code @Email} accepts padded values; canonical form is {@link uz.unikompas.user.User#normalizeEmail}.
 */
public record RegisterRequest(
        @Schema(example = "Og‘abek Malikov")
        @NotBlank @Size(min = 2, max = 120) String fullName,

        @Schema(example = "ogabek@example.com")
        @NotBlank @Email @Size(max = 160) String email,

        @Schema(example = "Parol2026")
        @NotBlank @Size(min = 8, max = 72) @MaxBytes(72)
        @Pattern(regexp = "^(?=.*\\p{L})(?=.*\\d).+$") String password) {

    /** Trim before Bean Validation runs, so " a@b.uz " is accepted and stored normalized. */
    public RegisterRequest {
        fullName = fullName == null ? null : fullName.trim();
        email = email == null ? null : email.trim();
    }
}

package uz.unikompas.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @Schema(example = "abituriyent@unikompas.uz") @NotBlank @Email String email,
        @Schema(example = "Demo123!") @NotBlank String password) {

    public LoginRequest {
        email = email == null ? null : email.trim();
    }
}

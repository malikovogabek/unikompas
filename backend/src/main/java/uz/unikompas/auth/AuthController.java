package uz.unikompas.auth;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import uz.unikompas.auth.dto.AuthResponse;
import uz.unikompas.auth.dto.LoginRequest;
import uz.unikompas.auth.dto.RegisterRequest;
import uz.unikompas.auth.dto.UserResponse;
import uz.unikompas.security.CurrentUser;

/**
 * Authentication endpoints (TZ §8, module M1).
 */
@Tag(name = "Auth", description = "Ro‘yxatdan o‘tish, tizimga kirish va joriy foydalanuvchi")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Registers a new applicant account and immediately returns a JWT,
     * so the client does not need a separate login call.
     */
    @Operation(summary = "Ro‘yxatdan o‘tish",
            description = "Yangi abituriyent hisobini yaratadi (rol: APPLICANT) va darhol JWT token qaytaradi. "
                    + "E-pochta katta-kichik harfdan qat’i nazar yagona bo‘lishi kerak.")
    @ApiResponse(responseCode = "201", description = "Hisob yaratildi, token qaytarildi")
    @ApiResponse(responseCode = "400", description = "VALIDATION_ERROR — maydonlar noto‘g‘ri")
    @ApiResponse(responseCode = "409", description = "EMAIL_TAKEN — bu e-pochta band")
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    /**
     * Verifies credentials and issues a JWT access token.
     */
    @Operation(summary = "Tizimga kirish",
            description = "E-pochta va parolni tekshiradi, muvaffaqiyatli bo‘lsa 24 soat amal qiladigan JWT qaytaradi. "
                    + "Noto‘g‘ri e-pochta va noto‘g‘ri parol uchun bir xil xato qaytariladi (xavfsizlik uchun).")
    @ApiResponse(responseCode = "200", description = "Token qaytarildi")
    @ApiResponse(responseCode = "401", description = "INVALID_CREDENTIALS — e-pochta yoki parol noto‘g‘ri")
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /**
     * Returns the profile of the user identified by the bearer token.
     */
    @Operation(summary = "Joriy foydalanuvchi",
            description = "Token egasining ma’lumotlarini (id, F.I.Sh., e-pochta, rol) qaytaradi. "
                    + "Frontend sahifa yangilanganda sessiyani tiklash uchun ishlatadi.")
    @ApiResponse(responseCode = "200", description = "Foydalanuvchi ma’lumotlari")
    @ApiResponse(responseCode = "401", description = "UNAUTHORIZED — token yo‘q yoki muddati o‘tgan")
    @SecurityRequirement(name = "bearer")
    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal Jwt jwt) {
        return authService.me(CurrentUser.from(jwt).id());
    }
}

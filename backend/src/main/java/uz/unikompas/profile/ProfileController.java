package uz.unikompas.profile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.unikompas.profile.dto.ProfileResponse;
import uz.unikompas.profile.dto.ProfileUpdateRequest;
import uz.unikompas.security.CurrentUser;

/**
 * Applicant profile endpoints (module M2).
 */
@Tag(name = "Profil", description = "Abituriyent profili: fanlar, bal, hudud va afzalliklar")
@SecurityRequirement(name = "bearer")
@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
@PreAuthorize("hasRole('APPLICANT')")
public class ProfileController {

    private final ProfileService profileService;

    /** Returns the caller's profile, or an empty one (complete=false) if never saved. */
    @Operation(summary = "Mening profilim",
            description = "Abituriyent profilini qaytaradi. Profil hali saqlanmagan bo‘lsa, bo‘sh profil "
                    + "(`complete: false`) qaytariladi. Bunda 404 emas, frontend formani bo‘sh holda ochadi.")
    @ApiResponse(responseCode = "200", description = "Profil")
    @ApiResponse(responseCode = "403", description = "FORBIDDEN — faqat abituriyentlar uchun")
    @GetMapping("/me")
    public ProfileResponse get(@AuthenticationPrincipal Jwt jwt) {
        return profileService.get(CurrentUser.from(jwt).id());
    }

    /** Creates or fully replaces the caller's profile. */
    @Operation(summary = "Profilni saqlash",
            description = "Profilni yaratadi yoki to‘liq yangilaydi (PUT). Hudud, fanlar va sohalar mavjudligi "
                    + "tekshiriladi, 1- va 2-fan bir xil bo‘lmasligi kerak. Ixtiyoriy afzalliklar uchun null "
                    + "qiymati “farqi yo‘q” degani.")
    @ApiResponse(responseCode = "200", description = "Saqlangan profil")
    @ApiResponse(responseCode = "400", description = "VALIDATION_ERROR — fieldErrors bilan "
            + "(masalan `secondSubjectId: DistinctSubjects`, `regionId: Exists`)")
    @PutMapping("/me")
    public ProfileResponse update(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ProfileUpdateRequest request) {
        return profileService.update(CurrentUser.from(jwt).id(), request);
    }
}

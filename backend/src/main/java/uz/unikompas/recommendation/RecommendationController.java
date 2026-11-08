package uz.unikompas.recommendation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import uz.unikompas.common.dto.PageResponse;
import uz.unikompas.recommendation.dto.RecommendationResponse;
import uz.unikompas.recommendation.dto.RecommendationSummaryResponse;
import uz.unikompas.security.CurrentUser;

/**
 * Recommendation endpoints (module M6).
 */
@Tag(name = "Tavsiyalar", description = "Gibrid tavsiya algoritmi: mos yo‘nalishlar va OTM dasturlari")
@SecurityRequirement(name = "bearer")
@RestController
@RequestMapping("/api/v1/recommendations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('APPLICANT')")
public class RecommendationController {

    private final RecommendationService service;

    /**
     * Generates a new recommendation for the current applicant using the hybrid scoring
     * model (interest, chance, preference, rating — TZ §6) and persists it.
     */
    @Operation(summary = "Yangi tavsiya generatsiya qilish",
            description = "Profil (fanlar, bal, hudud, afzalliklar) va oxirgi RIASEC natijasi asosida: "
                    + "1) qat’iy filtrlar, 2) qiziqish (I), kirish ehtimoli (C), afzallik (P), reyting (R) "
                    + "mezonlari, 3) vaznli yakuniy ball, 4) Ishonchli/Maqbul/Orzu toifalari, 5) sabablar. "
                    + "Test topshirilmagan bo‘lsa, qiziqish tanlangan sohalar bo‘yicha baholanadi (sovuq start). "
                    + "Natija saqlanadi.")
    @ApiResponse(responseCode = "201", description = "Tavsiya yaratildi (mos dastur bo‘lmasa ro‘yxatlar bo‘sh)")
    @ApiResponse(responseCode = "409", description = "PROFILE_INCOMPLETE — hudud, fanlar yoki bal kiritilmagan")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecommendationResponse generate(@AuthenticationPrincipal Jwt jwt) {
        return service.generate(CurrentUser.from(jwt).id());
    }

    /** Most recent recommendation of the caller. */
    @Operation(summary = "Oxirgi tavsiya", description = "Abituriyentning eng so‘nggi tavsiya natijasi.")
    @ApiResponse(responseCode = "200", description = "Tavsiya")
    @ApiResponse(responseCode = "404", description = "NOT_FOUND — hali tavsiya generatsiya qilinmagan")
    @GetMapping("/latest")
    public RecommendationResponse latest(@AuthenticationPrincipal Jwt jwt) {
        return service.latest(CurrentUser.from(jwt).id());
    }

    /** Past recommendations, newest first, with match counts per category. */
    @Operation(summary = "Tavsiyalar tarixi",
            description = "Sahifalangan ro‘yxat (yangidan eskiga): sana va har bir toifadagi mos dasturlar soni.")
    @ApiResponse(responseCode = "200", description = "Sahifalangan tarix (standart 10 ta)")
    @GetMapping
    public PageResponse<RecommendationSummaryResponse> history(@AuthenticationPrincipal Jwt jwt,
                                                               @PageableDefault(size = 10) Pageable pageable) {
        return service.history(CurrentUser.from(jwt).id(), pageable);
    }

    /** A specific recommendation; only its owner can read it. */
    @Operation(summary = "Tavsiya tafsilotlari",
            description = "Saqlangan tavsiyani qayta ko‘rsatadi. Boshqa foydalanuvchining tavsiyasi uchun 404.")
    @ApiResponse(responseCode = "200", description = "Tavsiya")
    @ApiResponse(responseCode = "404", description = "NOT_FOUND — topilmadi yoki sizga tegishli emas")
    @GetMapping("/{id}")
    public RecommendationResponse get(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return service.get(CurrentUser.from(jwt).id(), id);
    }
}

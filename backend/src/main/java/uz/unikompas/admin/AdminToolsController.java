package uz.unikompas.admin;

import java.io.IOException;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import uz.unikompas.admin.dto.ImportReport;
import uz.unikompas.admin.dto.StatsResponse;
import uz.unikompas.admin.dto.WeightsRequest;
import uz.unikompas.auth.dto.UserResponse;
import uz.unikompas.common.dto.PageResponse;
import uz.unikompas.common.exception.FieldValidationException;
import uz.unikompas.recommendation.RecommendationWeights;
import uz.unikompas.recommendation.RecommendationWeightsService;
import uz.unikompas.user.Role;

/**
 * Administrative tools: CSV import, algorithm settings, dashboard statistics and users
 * (FR-8.5–FR-8.8).
 */
@Tag(name = "Admin: Vositalar", description = "CSV import, algoritm vaznlari, statistika, foydalanuvchilar")
@SecurityRequirement(name = "bearer")
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminToolsController {

    private final PassingScoreImportService importService;
    private final RecommendationWeightsService weightsService;
    private final AdminStatsService statsService;
    private final AdminUserService userService;

    /** Bulk passing-score import; valid rows are saved, invalid ones are reported per line. */
    @Operation(summary = "O‘tish ballarini CSV orqali import qilish",
            description = "Sarlavha: `university,direction_code,language,study_form,year,grant_score,contract_score` "
                    + "(vergul yoki nuqtali vergul). `university` — OTMning qisqa nomi. Bo‘sh bal — o‘rin yo‘q. "
                    + "Yozuvlar (dastur, yil) bo‘yicha qo‘shiladi yoki yangilanadi. To‘g‘ri qatorlar saqlanadi, "
                    + "xato qatorlar hisobotda qator raqami va kodi bilan qaytariladi. Maksimal hajm 2 MB.")
    @ApiResponse(responseCode = "200", description = "Import hisoboti")
    @ApiResponse(responseCode = "400", description = "VALIDATION_ERROR (`file: InvalidHeader | Empty | TooManyRows`)")
    @ApiResponse(responseCode = "413", description = "PAYLOAD_TOO_LARGE — fayl 2 MB dan katta")
    @PostMapping(value = "/import/passing-scores", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ImportReport importScores(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw FieldValidationException.of("file", "Empty");
        }
        return importService.importCsv(file.getInputStream());
    }

    @Operation(summary = "Algoritm vaznlari", description = "Joriy w₁ (qiziqish), w₂ (ehtimol), w₃ (afzallik), w₄ (reyting).")
    @ApiResponse(responseCode = "200", description = "Vaznlar")
    @GetMapping("/settings/recommendation-weights")
    public RecommendationWeights weights() {
        return weightsService.current();
    }

    /** Updates weights; they must each be in [0, 1] and sum to 1. */
    @Operation(summary = "Algoritm vaznlarini o‘zgartirish",
            description = "Har biri 0–1 oralig‘ida, yig‘indisi 1 ga teng bo‘lishi kerak (±0,001). Yangi vaznlar "
                    + "keyingi generatsiya qilinadigan tavsiyalarga qo‘llanadi; eski natijalar o‘zgarmaydi.")
    @ApiResponse(responseCode = "200", description = "Saqlangan vaznlar")
    @ApiResponse(responseCode = "400", description = "VALIDATION_ERROR (`weights: SumToOne`)")
    @PutMapping("/settings/recommendation-weights")
    public RecommendationWeights updateWeights(@Valid @RequestBody WeightsRequest r) {
        RecommendationWeights w;
        try {
            w = new RecommendationWeights(r.interest(), r.chance(), r.preference(), r.rating());
        } catch (IllegalArgumentException e) {
            throw FieldValidationException.of("weights", "SumToOne");
        }
        return weightsService.update(w);
    }

    @Operation(summary = "Statistika",
            description = "Abituriyentlar, to‘liq profillar, testlar va tavsiyalar soni; katalog hajmi; tavsiyalarning "
                    + "top-10 talig‘ida eng ko‘p uchragan 5 ta yo‘nalish va OTM; hududlar bo‘yicha abituriyentlar.")
    @ApiResponse(responseCode = "200", description = "Statistika")
    @GetMapping("/stats")
    public StatsResponse stats() {
        return statsService.stats();
    }

    @Operation(summary = "Foydalanuvchilar", description = "E-pochta yoki F.I.Sh. bo‘yicha qidiruv, rol bo‘yicha filtr.")
    @ApiResponse(responseCode = "200", description = "Sahifalangan ro‘yxat")
    @GetMapping("/users")
    public PageResponse<UserResponse> users(@RequestParam(required = false) String search,
                                            @RequestParam(required = false) Role role,
                                            @PageableDefault(size = 20, sort = "createdAt",
                                                    direction = org.springframework.data.domain.Sort.Direction.DESC)
                                            Pageable pageable) {
        return userService.search(search, role, pageable);
    }
}

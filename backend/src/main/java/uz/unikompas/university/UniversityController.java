package uz.unikompas.university;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uz.unikompas.common.dto.PageResponse;
import uz.unikompas.program.ProgramService;
import uz.unikompas.program.dto.ProgramResponse;
import uz.unikompas.university.dto.UniversityDetailsResponse;
import uz.unikompas.university.dto.UniversityResponse;

/**
 * Public university catalog (FR-5.1, FR-5.2).
 */
@Tag(name = "OTMlar", description = "Oliy ta’lim muassasalari katalogi")
@RestController
@RequestMapping("/api/v1/universities")
@RequiredArgsConstructor
public class UniversityController {

    private final UniversityService universityService;
    private final ProgramService programService;

    /** Paged university list with optional search, region and type filters; best rated first by default. */
    @Operation(summary = "OTMlar ro‘yxati",
            description = "Nom yoki qisqa nom bo‘yicha qidiruv, hudud va tur (STATE, PRIVATE, FOREIGN_BRANCH) "
                    + "bo‘yicha filtrlash. Standart tartib — reyting bo‘yicha kamayish. "
                    + "Sahifalash: `page` (0 dan), `size` (≤ 100), `sort` (masalan `name,asc`).")
    @ApiResponse(responseCode = "200", description = "Sahifalangan ro‘yxat")
    @GetMapping
    public PageResponse<UniversityResponse> list(
            @Parameter(description = "Qidiruv matni") @RequestParam(required = false) String search,
            @Parameter(description = "Hudud id’si") @RequestParam(required = false) Long regionId,
            @Parameter(description = "OTM turi") @RequestParam(required = false) UniversityType type,
            @PageableDefault(size = 12, sort = "rating", direction = Sort.Direction.DESC) Pageable pageable) {
        return universityService.search(search, regionId, type, pageable);
    }

    /** University page data including the number of programs it offers. */
    @Operation(summary = "OTM tafsilotlari",
            description = "Tavsif, manzil, sayt, reyting, yotoqxona mavjudligi va dasturlar soni.")
    @ApiResponse(responseCode = "200", description = "OTM topildi")
    @ApiResponse(responseCode = "404", description = "NOT_FOUND — OTM mavjud emas")
    @GetMapping("/{id}")
    public UniversityDetailsResponse get(@PathVariable Long id) {
        return universityService.get(id);
    }

    /** All admission programs of a university with their passing-score history. */
    @Operation(summary = "OTM dasturlari",
            description = "OTMdagi barcha yo‘nalish takliflari (til va shakl bo‘yicha alohida) "
                    + "kvota, narx va o‘tish ballari tarixi bilan.")
    @ApiResponse(responseCode = "200", description = "Dasturlar ro‘yxati")
    @ApiResponse(responseCode = "404", description = "NOT_FOUND — OTM mavjud emas")
    @GetMapping("/{id}/programs")
    public List<ProgramResponse> programs(@PathVariable Long id) {
        return programService.byUniversity(id);
    }
}

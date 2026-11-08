package uz.unikompas.direction;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uz.unikompas.common.dto.PageResponse;
import uz.unikompas.direction.dto.DirectionDetailsResponse;
import uz.unikompas.direction.dto.DirectionResponse;
import uz.unikompas.program.ProgramService;
import uz.unikompas.program.dto.ProgramResponse;

/**
 * Public study direction catalog (FR-5.3, FR-5.4).
 */
@Tag(name = "Yo‘nalishlar", description = "Bakalavriat ta’lim yo‘nalishlari katalogi")
@RestController
@RequestMapping("/api/v1/directions")
@RequiredArgsConstructor
public class DirectionController {

    private final DirectionService directionService;
    private final ProgramService programService;

    /** Paged direction list filtered by text, knowledge area and the exam subject pair. */
    @Operation(summary = "Yo‘nalishlar ro‘yxati",
            description = "Nom yoki klassifikator kodi bo‘yicha qidiruv, soha va fanlar majmuasi bo‘yicha filtr. "
                    + "`subjectId1` — 1-fan, `subjectId2` — 2-fan (tartib muhim). Standart tartib — nom bo‘yicha.")
    @ApiResponse(responseCode = "200", description = "Sahifalangan ro‘yxat")
    @GetMapping
    public PageResponse<DirectionResponse> list(
            @Parameter(description = "Qidiruv matni (nom yoki kod)") @RequestParam(required = false) String search,
            @Parameter(description = "Bilim sohasi id’si") @RequestParam(required = false) Long fieldId,
            @Parameter(description = "1-fan id’si") @RequestParam(required = false) Long subjectId1,
            @Parameter(description = "2-fan id’si") @RequestParam(required = false) Long subjectId2,
            @PageableDefault(size = 12, sort = "name") Pageable pageable) {
        return directionService.search(search, fieldId, subjectId1, subjectId2, pageable);
    }

    /** Direction page: description, career prospects and RIASEC profile with its Holland code. */
    @Operation(summary = "Yo‘nalish tafsilotlari",
            description = "Tavsif, kasbiy istiqbollar, RIASEC profili (0–10) va undan hisoblangan Holland kodi "
                    + "(masalan, `ICR`), shu yo‘nalish mavjud dasturlar soni.")
    @ApiResponse(responseCode = "200", description = "Yo‘nalish topildi")
    @ApiResponse(responseCode = "404", description = "NOT_FOUND — yo‘nalish mavjud emas")
    @GetMapping("/{id}")
    public DirectionDetailsResponse get(@PathVariable Long id) {
        return directionService.get(id);
    }

    /** Universities offering the direction, best rated first, with score history. */
    @Operation(summary = "Yo‘nalish mavjud bo‘lgan OTM dasturlari",
            description = "Ushbu yo‘nalish bo‘yicha barcha OTM takliflari (reyting bo‘yicha), o‘tish ballari bilan.")
    @ApiResponse(responseCode = "200", description = "Dasturlar ro‘yxati")
    @ApiResponse(responseCode = "404", description = "NOT_FOUND — yo‘nalish mavjud emas")
    @GetMapping("/{id}/programs")
    public List<ProgramResponse> programs(@PathVariable Long id) {
        return programService.byDirection(id);
    }
}

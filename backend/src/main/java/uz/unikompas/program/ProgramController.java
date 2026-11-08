package uz.unikompas.program;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uz.unikompas.program.dto.ProgramResponse;

/**
 * Public program endpoints: details with score history and side-by-side comparison.
 */
@Tag(name = "Dasturlar", description = "OTMdagi aniq yo‘nalish takliflari: kvota, narx, o‘tish ballari")
@RestController
@RequestMapping("/api/v1/programs")
@RequiredArgsConstructor
public class ProgramController {

    private final ProgramService programService;

    /** Returns one program with quotas, fee and passing-score history. */
    @Operation(summary = "Dastur tafsilotlari",
            description = "OTM, yo‘nalish, ta’lim tili va shakli, grant/kontrakt kvotalari, yillik kontrakt narxi "
                    + "hamda so‘nggi yillar o‘tish ballari (eski → yangi). Dastur sahifasidagi grafik uchun.")
    @ApiResponse(responseCode = "200", description = "Dastur topildi")
    @ApiResponse(responseCode = "404", description = "NOT_FOUND — dastur mavjud emas")
    @GetMapping("/{id}")
    public ProgramResponse get(@PathVariable Long id) {
        return programService.get(id);
    }

    /** Returns 2–4 programs for side-by-side comparison, in the requested order. */
    @Operation(summary = "Dasturlarni taqqoslash",
            description = "2 tadan 4 tagacha dasturni yonma-yon taqqoslash uchun ma’lumot qaytaradi "
                    + "(ballar, narx, kvota, hudud, reyting). Tartib so‘rovdagi tartibga mos.")
    @ApiResponse(responseCode = "200", description = "Taqqoslash ma’lumotlari")
    @ApiResponse(responseCode = "400", description = "VALIDATION_ERROR — id’lar soni 2–4 oralig‘ida emas")
    @ApiResponse(responseCode = "404", description = "NOT_FOUND — dasturlardan biri topilmadi")
    @GetMapping("/compare")
    public List<ProgramResponse> compare(
            @Parameter(description = "Vergul bilan ajratilgan dastur id’lari", example = "1,2,3")
            @RequestParam List<Long> ids) {
        return programService.compare(ids);
    }
}

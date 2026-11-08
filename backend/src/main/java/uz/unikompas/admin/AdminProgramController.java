package uz.unikompas.admin;

import java.util.List;

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
import uz.unikompas.common.dto.PageResponse;
import uz.unikompas.program.ProgramAdminService;
import uz.unikompas.program.dto.PassingScoreRequest;
import uz.unikompas.program.dto.ProgramRequest;
import uz.unikompas.program.dto.ProgramResponse;

/**
 * Program and passing-score management for administrators (FR-8.3, FR-8.4).
 */
@Tag(name = "Admin: Dasturlar", description = "Dasturlar (OTM + yo‘nalish + til + shakl) va o‘tish ballari")
@SecurityRequirement(name = "bearer")
@RestController
@RequestMapping("/api/v1/admin/programs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminProgramController {

    private final ProgramAdminService service;

    @Operation(summary = "Dasturlar (admin jadvali)",
            description = "OTM va/yoki yo‘nalish bo‘yicha filtr, o‘tish ballari tarixi bilan.")
    @ApiResponse(responseCode = "200", description = "Sahifalangan ro‘yxat")
    @GetMapping
    public PageResponse<ProgramResponse> list(@RequestParam(required = false) Long universityId,
                                              @RequestParam(required = false) Long directionId,
                                              @PageableDefault(size = 20) Pageable pageable) {
        return service.list(universityId, directionId, pageable);
    }

    /** Creates a program; the (university, direction, language, form) combination must be unique. */
    @Operation(summary = "Dastur yaratish",
            description = "OTM, yo‘nalish, til va shakl birikmasi yagona bo‘lishi kerak; kvota va narx manfiy emas.")
    @ApiResponse(responseCode = "201", description = "Yaratildi")
    @ApiResponse(responseCode = "400", description = "VALIDATION_ERROR (`studyForm: Unique`, `universityId: Exists` ...)")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProgramResponse create(@Valid @RequestBody ProgramRequest request) {
        return service.create(request);
    }

    @Operation(summary = "Dasturni tahrirlash", description = "Barcha maydonlarni yangilaydi (PUT).")
    @ApiResponse(responseCode = "200", description = "Yangilandi")
    @ApiResponse(responseCode = "404", description = "NOT_FOUND")
    @PutMapping("/{id}")
    public ProgramResponse update(@PathVariable Long id, @Valid @RequestBody ProgramRequest request) {
        return service.update(id, request);
    }

    @Operation(summary = "Dasturni o‘chirish", description = "Dastur, uning ballari va saralanganlardagi yozuvlar o‘chiriladi.")
    @ApiResponse(responseCode = "204", description = "O‘chirildi")
    @ApiResponse(responseCode = "404", description = "NOT_FOUND")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    /** Replaces the full passing-score history of a program. */
    @Operation(summary = "O‘tish ballarini kiritish",
            description = "Dasturning butun ballar tarixini almashtiradi: ro‘yxatdagi yillar qo‘shiladi yoki "
                    + "yangilanadi, ro‘yxatda yo‘q yillar o‘chiriladi. Bo‘sh (null) bal — o‘sha turdagi o‘rin yo‘q.")
    @ApiResponse(responseCode = "200", description = "Yangilangan dastur va ballar tarixi")
    @ApiResponse(responseCode = "400", description = "VALIDATION_ERROR (`year: Duplicate`, ball 0–189 emas)")
    @ApiResponse(responseCode = "404", description = "NOT_FOUND")
    @PutMapping("/{id}/passing-scores")
    public ProgramResponse replaceScores(@PathVariable Long id,
                                         @RequestBody List<@Valid PassingScoreRequest> scores) {
        return service.replaceScores(id, scores);
    }
}

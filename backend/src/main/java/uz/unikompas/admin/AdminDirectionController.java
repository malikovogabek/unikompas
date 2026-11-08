package uz.unikompas.admin;

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
import uz.unikompas.direction.DirectionService;
import uz.unikompas.direction.dto.DirectionDetailsResponse;
import uz.unikompas.direction.dto.DirectionRequest;
import uz.unikompas.direction.dto.DirectionResponse;

/**
 * Study direction management for administrators (FR-8.2).
 */
@Tag(name = "Admin: Yo‘nalishlar", description = "Yo‘nalishlar, fanlar majmuasi va RIASEC profillari")
@SecurityRequirement(name = "bearer")
@RestController
@RequestMapping("/api/v1/admin/directions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDirectionController {

    private final DirectionService service;

    @Operation(summary = "Yo‘nalishlar (admin jadvali)", description = "Sahifalangan ro‘yxat; standart tartib — kod.")
    @ApiResponse(responseCode = "200", description = "Sahifalangan ro‘yxat")
    @GetMapping
    public PageResponse<DirectionResponse> list(@RequestParam(required = false) String search,
                                                @RequestParam(required = false) Long fieldId,
                                                @PageableDefault(size = 20, sort = "code") Pageable pageable) {
        return service.search(search, fieldId, null, null, pageable);
    }

    /** Creates a direction with its subject pair and RIASEC profile. */
    @Operation(summary = "Yo‘nalish yaratish",
            description = "Kod yagona bo‘lishi, soha va fanlar mavjud bo‘lishi, 1- va 2-fan farqli bo‘lishi kerak. "
                    + "RIASEC profili (0–10) tavsiya algoritmidagi qiziqish mezoniga bevosita ta’sir qiladi.")
    @ApiResponse(responseCode = "201", description = "Yaratildi")
    @ApiResponse(responseCode = "400", description = "VALIDATION_ERROR (`code: Unique`, `secondSubjectId: DistinctSubjects` ...)")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DirectionDetailsResponse create(@Valid @RequestBody DirectionRequest request) {
        return service.create(request);
    }

    @Operation(summary = "Yo‘nalishni tahrirlash", description = "Barcha maydonlarni yangilaydi (PUT).")
    @ApiResponse(responseCode = "200", description = "Yangilandi")
    @ApiResponse(responseCode = "404", description = "NOT_FOUND")
    @PutMapping("/{id}")
    public DirectionDetailsResponse update(@PathVariable Long id, @Valid @RequestBody DirectionRequest request) {
        return service.update(id, request);
    }

    @Operation(summary = "Yo‘nalishni o‘chirish", description = "Yo‘nalish va uning barcha dasturlari o‘chiriladi.")
    @ApiResponse(responseCode = "204", description = "O‘chirildi")
    @ApiResponse(responseCode = "404", description = "NOT_FOUND")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}

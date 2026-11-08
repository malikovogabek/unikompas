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
import uz.unikompas.university.UniversityService;
import uz.unikompas.university.UniversityType;
import uz.unikompas.university.dto.UniversityDetailsResponse;
import uz.unikompas.university.dto.UniversityRequest;
import uz.unikompas.university.dto.UniversityResponse;

/**
 * University management for administrators (FR-8.1).
 */
@Tag(name = "Admin: OTMlar", description = "OTMlarni yaratish, tahrirlash va o‘chirish")
@SecurityRequirement(name = "bearer")
@RestController
@RequestMapping("/api/v1/admin/universities")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUniversityController {

    private final UniversityService service;

    /** Same filters as the public catalog, alphabetical by default for management tables. */
    @Operation(summary = "OTMlar (admin jadvali)",
            description = "Katalogdagi filtrlar bilan sahifalangan ro‘yxat; standart tartib — nom bo‘yicha.")
    @ApiResponse(responseCode = "200", description = "Sahifalangan ro‘yxat")
    @GetMapping
    public PageResponse<UniversityResponse> list(@RequestParam(required = false) String search,
                                                 @RequestParam(required = false) Long regionId,
                                                 @RequestParam(required = false) UniversityType type,
                                                 @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        return service.search(search, regionId, type, pageable);
    }

    /** Creates a university. */
    @Operation(summary = "OTM yaratish",
            description = "Yangi OTM qo‘shadi. Hudud mavjudligi tekshiriladi, reyting 0–100 oralig‘ida bo‘lishi kerak.")
    @ApiResponse(responseCode = "201", description = "Yaratildi")
    @ApiResponse(responseCode = "400", description = "VALIDATION_ERROR (`regionId: Exists`, `shortName: Unique`)")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UniversityDetailsResponse create(@Valid @RequestBody UniversityRequest request) {
        return service.create(request);
    }

    /** Replaces all fields of a university. */
    @Operation(summary = "OTMni tahrirlash", description = "Barcha maydonlarni yangilaydi (PUT).")
    @ApiResponse(responseCode = "200", description = "Yangilandi")
    @ApiResponse(responseCode = "404", description = "NOT_FOUND")
    @PutMapping("/{id}")
    public UniversityDetailsResponse update(@PathVariable Long id, @Valid @RequestBody UniversityRequest request) {
        return service.update(id, request);
    }

    /** Deletes a university with all its programs. */
    @Operation(summary = "OTMni o‘chirish",
            description = "OTM va unga tegishli barcha dasturlar, o‘tish ballari va saralanganlar o‘chiriladi. "
                    + "Diqqat: bu dasturlar abituriyentlarning saqlangan tavsiyalaridan ham olib tashlanadi.")
    @ApiResponse(responseCode = "204", description = "O‘chirildi")
    @ApiResponse(responseCode = "404", description = "NOT_FOUND")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}

package uz.unikompas.favorite;

import java.util.List;

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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import uz.unikompas.common.dto.PageResponse;
import uz.unikompas.program.dto.ProgramResponse;
import uz.unikompas.security.CurrentUser;

/**
 * Saved programs (FR-7.1).
 */
@Tag(name = "Saralanganlar", description = "Abituriyent saqlab qo‘ygan dasturlar")
@SecurityRequirement(name = "bearer")
@RestController
@RequestMapping("/api/v1/favorites")
@RequiredArgsConstructor
@PreAuthorize("hasRole('APPLICANT')")
public class FavoriteController {

    private final FavoriteService service;

    /** Saved programs, most recently added first. */
    @Operation(summary = "Saralangan dasturlar",
            description = "Sahifalangan ro‘yxat, oxirgi qo‘shilganidan boshlab, o‘tish ballari bilan.")
    @ApiResponse(responseCode = "200", description = "Sahifalangan ro‘yxat (standart 20 ta)")
    @GetMapping
    public PageResponse<ProgramResponse> list(@AuthenticationPrincipal Jwt jwt,
                                              @PageableDefault(size = 20) Pageable pageable) {
        return service.list(CurrentUser.from(jwt).id(), pageable);
    }

    /** Ids of all saved programmes (for "saved" indicators across the UI). */
    @Operation(summary = "Saralangan dastur id’lari",
            description = "Barcha saralangan dasturlar id’lari. UI’dagi “yurakcha” holatini ko‘rsatish uchun.")
    @ApiResponse(responseCode = "200", description = "Id’lar ro‘yxati")
    @GetMapping("/ids")
    public List<Long> ids(@AuthenticationPrincipal Jwt jwt) {
        return service.ids(CurrentUser.from(jwt).id());
    }

    /** Saves a program; repeating the call has no effect. */
    @Operation(summary = "Saralanganlarga qo‘shish",
            description = "Dasturni saqlaydi. Idempotent: takroriy chaqiruv xato bermaydi.")
    @ApiResponse(responseCode = "204", description = "Qo‘shildi")
    @ApiResponse(responseCode = "404", description = "NOT_FOUND — dastur mavjud emas")
    @PutMapping("/{programId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void add(@AuthenticationPrincipal Jwt jwt, @PathVariable Long programId) {
        service.add(CurrentUser.from(jwt).id(), programId);
    }

    /** Removes a saved program; removing a non-saved one is a no-op. */
    @Operation(summary = "Saralanganlardan o‘chirish", description = "Idempotent.")
    @ApiResponse(responseCode = "204", description = "O‘chirildi")
    @DeleteMapping("/{programId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@AuthenticationPrincipal Jwt jwt, @PathVariable Long programId) {
        service.remove(CurrentUser.from(jwt).id(), programId);
    }
}

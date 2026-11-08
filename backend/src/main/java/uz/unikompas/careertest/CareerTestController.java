package uz.unikompas.careertest;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import uz.unikompas.careertest.dto.QuestionResponse;
import uz.unikompas.common.dto.PageResponse;
import uz.unikompas.careertest.dto.SubmitTestRequest;
import uz.unikompas.careertest.dto.TestResultResponse;
import uz.unikompas.security.CurrentUser;

/**
 * RIASEC career-interest test endpoints (module M4).
 */
@Tag(name = "Kasbiy test", description = "Holland RIASEC kasbiy qiziqishlar testi")
@SecurityRequirement(name = "bearer")
@RestController
@RequestMapping("/api/v1/career-test")
@RequiredArgsConstructor
@PreAuthorize("hasRole('APPLICANT')")
public class CareerTestController {

    private final CareerTestService service;

    /** Returns the 36 questionnaire items in display order with uz/ru/en texts. */
    @Operation(summary = "Test savollari",
            description = "36 ta savol (6 tip × 6), ko‘rsatish tartibida, uch tildagi matni bilan. "
                    + "Savolning RIASEC tipi ataylab qaytarilmaydi. Belgilangan kichik to‘plam, sahifalanmaydi.")
    @ApiResponse(responseCode = "200", description = "36 ta savol")
    @GetMapping("/questions")
    public List<QuestionResponse> questions() {
        return service.questions();
    }

    /** Scores the answers, stores the attempt and returns the RIASEC profile. */
    @Operation(summary = "Testni topshirish",
            description = "Har bir savolga 1–5 (Likert) javob yuboriladi. Har bir tip uchun ball "
                    + "(yig‘indi − n) / 4n formulasi bilan 0–1 oralig‘ida hisoblanadi, eng yuqori 3 ta tipdan "
                    + "Holland kodi tuziladi. Natija saqlanadi va tavsiyada ishlatiladi.")
    @ApiResponse(responseCode = "201", description = "Natija")
    @ApiResponse(responseCode = "400", description = "VALIDATION_ERROR — barcha savollarga aynan bir marta "
            + "javob berilmagan (`answers: AllQuestionsRequired | Duplicate`) yoki qiymat 1–5 emas")
    @PostMapping("/submit")
    @ResponseStatus(HttpStatus.CREATED)
    public TestResultResponse submit(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody SubmitTestRequest request) {
        return service.submit(CurrentUser.from(jwt).id(), request);
    }

    /** Latest result of the caller. */
    @Operation(summary = "Oxirgi test natijasi",
            description = "Radar diagramma uchun 6 ta ball va Holland kodi.")
    @ApiResponse(responseCode = "200", description = "Natija")
    @ApiResponse(responseCode = "404", description = "NOT_FOUND — test hali topshirilmagan")
    @GetMapping("/results/latest")
    public TestResultResponse latest(@AuthenticationPrincipal Jwt jwt) {
        return service.latest(CurrentUser.from(jwt).id());
    }

    /** Past results, newest first. */
    @Operation(summary = "Test natijalari tarixi", description = "Sahifalangan ro‘yxat, yangidan eskiga.")
    @ApiResponse(responseCode = "200", description = "Sahifalangan tarix (standart 10 ta)")
    @GetMapping("/results")
    public PageResponse<TestResultResponse> history(@AuthenticationPrincipal Jwt jwt,
                                                    @PageableDefault(size = 10) Pageable pageable) {
        return service.history(CurrentUser.from(jwt).id(), pageable);
    }
}

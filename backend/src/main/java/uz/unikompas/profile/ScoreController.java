package uz.unikompas.profile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.unikompas.profile.dto.ScoreCalculationRequest;
import uz.unikompas.profile.dto.ScoreCalculationResponse;

/**
 * Public score calculator (FR-3.1, FR-3.2).
 */
@Tag(name = "Ball kalkulyatori", description = "To‘g‘ri javoblar soni bo‘yicha test balini hisoblash")
@RestController
@RequestMapping("/api/v1/score")
@RequiredArgsConstructor
public class ScoreController {

    private final ScoreCalculator calculator;

    /** Converts correct-answer counts into the weighted entrance score (max 189). */
    @Operation(summary = "Balni hisoblash",
            description = "Majburiy fanlar (×1,1), 1-fan (×3,1) va 2-fan (×2,1) bo‘yicha to‘g‘ri javoblar sonidan "
                    + "umumiy balni hisoblaydi. Maksimal bal — 189. Mehmonlar uchun ham ochiq.")
    @ApiResponse(responseCode = "200", description = "Hisoblangan ball va bloklar bo‘yicha taqsimot")
    @ApiResponse(responseCode = "400", description = "VALIDATION_ERROR — qiymatlar 0–30 oralig‘ida emas")
    @PostMapping("/calculate")
    public ScoreCalculationResponse calculate(@Valid @RequestBody ScoreCalculationRequest request) {
        return calculator.calculate(request);
    }
}

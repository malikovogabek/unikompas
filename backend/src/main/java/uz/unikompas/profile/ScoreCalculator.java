package uz.unikompas.profile;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.stereotype.Component;
import uz.unikompas.profile.dto.ScoreCalculationRequest;
import uz.unikompas.profile.dto.ScoreCalculationResponse;

/**
 * Entrance test score formula (FR-3.1). All admission-rule constants live here,
 * so a change in the official rules is a one-place edit:
 * <pre>
 *   total = 1.1 · mandatory(0..30) + 3.1 · firstSubject(0..30) + 2.1 · secondSubject(0..30),  max 189
 * </pre>
 */
@Component
public class ScoreCalculator {

    public static final int QUESTIONS_PER_BLOCK = 30;
    static final BigDecimal MANDATORY_WEIGHT = new BigDecimal("1.1");
    static final BigDecimal FIRST_SUBJECT_WEIGHT = new BigDecimal("3.1");
    static final BigDecimal SECOND_SUBJECT_WEIGHT = new BigDecimal("2.1");
    public static final BigDecimal MAX_TOTAL = MANDATORY_WEIGHT.add(FIRST_SUBJECT_WEIGHT).add(SECOND_SUBJECT_WEIGHT)
            .multiply(BigDecimal.valueOf(QUESTIONS_PER_BLOCK));

    public ScoreCalculationResponse calculate(ScoreCalculationRequest req) {
        BigDecimal mandatory = weighted(req.mandatoryCorrect(), MANDATORY_WEIGHT);
        BigDecimal first = weighted(req.firstSubjectCorrect(), FIRST_SUBJECT_WEIGHT);
        BigDecimal second = weighted(req.secondSubjectCorrect(), SECOND_SUBJECT_WEIGHT);
        return new ScoreCalculationResponse(mandatory, first, second,
                weighted(QUESTIONS_PER_BLOCK, MANDATORY_WEIGHT), weighted(QUESTIONS_PER_BLOCK, FIRST_SUBJECT_WEIGHT),
                weighted(QUESTIONS_PER_BLOCK, SECOND_SUBJECT_WEIGHT), mandatory.add(first).add(second), MAX_TOTAL);
    }

    private static BigDecimal weighted(int correct, BigDecimal weight) {
        return weight.multiply(BigDecimal.valueOf(correct)).setScale(1, RoundingMode.HALF_UP);
    }
}

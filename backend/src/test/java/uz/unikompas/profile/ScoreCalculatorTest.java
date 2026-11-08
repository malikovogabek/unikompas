package uz.unikompas.profile;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;
import uz.unikompas.profile.dto.ScoreCalculationRequest;
import uz.unikompas.profile.dto.ScoreCalculationResponse;

class ScoreCalculatorTest {

    private final ScoreCalculator calculator = new ScoreCalculator();

    @Test
    void shouldReturnMaximum189_whenAllAnswersCorrect() {
        ScoreCalculationResponse r = calculator.calculate(new ScoreCalculationRequest(30, 30, 30));
        assertThat(r.total()).isEqualByComparingTo("189.0");
        assertThat(r.maxTotal()).isEqualByComparingTo("189");
    }

    @Test
    void shouldApplyBlockWeights() {
        ScoreCalculationResponse r = calculator.calculate(new ScoreCalculationRequest(24, 26, 22));
        assertThat(r.mandatoryScore()).isEqualByComparingTo("26.4");
        assertThat(r.firstSubjectScore()).isEqualByComparingTo("80.6");
        assertThat(r.secondSubjectScore()).isEqualByComparingTo("46.2");
        assertThat(r.total()).isEqualByComparingTo("153.2");
    }

    @Test
    void shouldReturnZero_whenNoCorrectAnswers() {
        assertThat(calculator.calculate(new ScoreCalculationRequest(0, 0, 0)).total()).isEqualByComparingTo(BigDecimal.ZERO);
    }
}

package uz.unikompas.recommendation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;

class ChanceEstimatorTest {

    /** Consecutive years ending in 2026. */
    static List<YearScore> years(double... scores) {
        List<YearScore> list = new ArrayList<>();
        for (int i = 0; i < scores.length; i++) {
            list.add(new YearScore(2026 - scores.length + 1 + i, scores[i]));
        }
        return list;
    }

    @Test
    void shouldForecastLastValuePlusAverageTrend() {
        assertThat(ChanceEstimator.forecast(years(150, 152, 156), 2027).getAsDouble()).isEqualTo(159.0);
    }

    @Test
    void shouldUseOnlyLastThreeCalendarYears() {
        // 2023: 100 is outside the 2024–2026 window: trend = (156 − 150) / 2 = 3
        assertThat(ChanceEstimator.trend(years(100, 150, 153, 156))).isEqualTo(3.0);
    }

    @Test
    void shouldDivideByElapsedYears_whenYearsAreMissing() {
        // 2024 = 150, 2025 missing, 2026 = 160 → 5 per year, not 10
        List<YearScore> gap = List.of(new YearScore(2024, 150), new YearScore(2026, 160));
        assertThat(ChanceEstimator.trend(gap)).isEqualTo(5.0);
        assertThat(ChanceEstimator.forecast(gap, 2027).getAsDouble()).isEqualTo(165.0);
    }

    @Test
    void shouldExtrapolateOverGap_andIgnoreStaleHistory() {
        List<YearScore> lastIn2025 = List.of(new YearScore(2024, 140), new YearScore(2025, 142));
        assertThat(ChanceEstimator.forecast(lastIn2025, 2027).getAsDouble()).isEqualTo(146.0);
        assertThat(ChanceEstimator.forecast(List.of(new YearScore(2018, 150)), 2027)).isEmpty();
    }

    @Test
    void shouldClampExtremeTrend() {
        assertThat(ChanceEstimator.trend(years(100, 140))).isEqualTo(10.0);
        assertThat(ChanceEstimator.trend(years(140, 100))).isEqualTo(-10.0);
    }

    @Test
    void shouldReturnLastValue_whenSingleYear_andEmpty_whenNoHistory() {
        assertThat(ChanceEstimator.forecast(years(120), 2027).getAsDouble()).isEqualTo(120.0);
        assertThat(ChanceEstimator.forecast(List.of(), 2027)).isEmpty();
    }

    @Test
    void shouldFollowLogisticCurve() {
        assertThat(ChanceEstimator.probability(150, 150)).isEqualTo(0.5);
        assertThat(ChanceEstimator.probability(160, 150)).isCloseTo(0.924, within(0.001));
        assertThat(ChanceEstimator.probability(140, 150)).isCloseTo(0.076, within(0.001));
    }
}

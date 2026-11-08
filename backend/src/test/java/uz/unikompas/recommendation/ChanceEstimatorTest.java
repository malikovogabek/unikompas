package uz.unikompas.recommendation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

import java.util.List;

import org.junit.jupiter.api.Test;

class ChanceEstimatorTest {

    @Test
    void shouldForecastLastValuePlusAverageTrend() {
        assertThat(ChanceEstimator.forecast(List.of(150.0, 152.0, 156.0)).getAsDouble()).isEqualTo(159.0);
    }

    @Test
    void shouldUseOnlyLastThreeYears() {
        // 100 → 150 jump is outside the 3-year window: trend = (156 − 150) / 2 = 3
        assertThat(ChanceEstimator.trend(List.of(100.0, 150.0, 153.0, 156.0))).isEqualTo(3.0);
    }

    @Test
    void shouldClampExtremeTrend() {
        assertThat(ChanceEstimator.trend(List.of(100.0, 140.0))).isEqualTo(10.0);
        assertThat(ChanceEstimator.trend(List.of(140.0, 100.0))).isEqualTo(-10.0);
    }

    @Test
    void shouldReturnLastValue_whenSingleYear_andEmpty_whenNoHistory() {
        assertThat(ChanceEstimator.forecast(List.of(120.0)).getAsDouble()).isEqualTo(120.0);
        assertThat(ChanceEstimator.forecast(List.of())).isEmpty();
    }

    @Test
    void shouldFollowLogisticCurve() {
        assertThat(ChanceEstimator.probability(150, 150)).isEqualTo(0.5);
        assertThat(ChanceEstimator.probability(160, 150)).isCloseTo(0.924, within(0.001));
        assertThat(ChanceEstimator.probability(140, 150)).isCloseTo(0.076, within(0.001));
        assertThat(ChanceEstimator.probability(155, 150)).isGreaterThan(ChanceEstimator.probability(152, 150));
    }
}

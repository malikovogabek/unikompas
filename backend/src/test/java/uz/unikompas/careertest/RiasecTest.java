package uz.unikompas.careertest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class RiasecTest {

    @Test
    void shouldPickThreeHighestDimensions() {
        assertThat(Riasec.hollandCode(new double[] {5, 9, 3, 2, 3, 6})).isEqualTo("ICR");
    }

    @Test
    void shouldBreakTiesInRiasecOrder() {
        assertThat(Riasec.hollandCode(new double[] {1, 1, 1, 1, 1, 1})).isEqualTo("RIA");
        assertThat(Riasec.hollandCode(new double[] {0, 0, 0, 7, 7, 7})).isEqualTo("SEC");
    }

    @Test
    void shouldRejectWrongLength() {
        assertThatThrownBy(() -> Riasec.hollandCode(new double[] {1, 2})).isInstanceOf(IllegalArgumentException.class);
    }
}

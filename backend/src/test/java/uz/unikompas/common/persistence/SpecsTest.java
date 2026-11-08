package uz.unikompas.common.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class SpecsTest {

    @Test
    void shouldEscapeLikeMetacharactersAndLowercase() {
        assertThat(Specs.likePattern(" 50%_A\\b ")).isEqualTo("%50\\%\\_a\\\\b%");
    }
}

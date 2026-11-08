package uz.unikompas.recommendation;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.Set;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import uz.unikompas.profile.Financing;
import uz.unikompas.program.StudyForm;
import uz.unikompas.program.StudyLanguage;

/**
 * NFR-1: scoring must stay well under 1 s for a catalog of 5 000 programmes.
 * Wall-clock based, so it is tagged "performance" and excluded from the default build;
 * run with {@code ./mvnw test -Pperf} (measured: ~4 ms on a laptop).
 */
@Tag("performance")
class RecommendationEngineScalabilityTest {

    @Test
    void shouldScore5000ProgrammesWellUnderOneSecond() {
        Random random = new Random(42);
        List<ProgramCandidate> candidates = new ArrayList<>();
        for (int i = 0; i < 5_000; i++) {
            double base = 110 + random.nextDouble() * 70;
            double[] riasec = new double[6];
            for (int k = 0; k < 6; k++) {
                riasec[k] = random.nextInt(11);
            }
            candidates.add(new ProgramCandidate(i, i % 400, 1 + i % 12, 1, 2, riasec, 1 + i % 14, 50 + i % 50,
                    StudyLanguage.UZ, StudyForm.FULL_TIME, i % 3 == 0 ? 0 : 20, 60, 8_000_000 + (i % 20) * 500_000L,
                    i % 3 == 0 ? List.of() : List.of(new YearScore(2024, base - 2), new YearScore(2025, base - 1),
                            new YearScore(2026, base)),
                    List.of(new YearScore(2024, base - 32), new YearScore(2025, base - 31), new YearScore(2026, base - 30))));
        }
        ApplicantInput applicant = new ApplicantInput(150, 1, 2, 6, null, null, Financing.CONTRACT_OK, 15_000_000L,
                true, Set.of(1L, 2L), new double[] {0.4, 0.95, 0.2, 0.1, 0.3, 0.6}, "ICR");
        RecommendationEngine engine = new RecommendationEngine();

        for (int i = 0; i < 5; i++) { // JIT warm-up
            engine.score(applicant, candidates, RecommendationWeights.DEFAULT, 2027);
        }
        long start = System.nanoTime();
        List<ScoredProgram> result = engine.score(applicant, candidates, RecommendationWeights.DEFAULT, 2027);
        long millis = (System.nanoTime() - start) / 1_000_000;

        assertThat(result).isNotEmpty();
        assertThat(millis).as("scoring %d programmes took %d ms", candidates.size(), millis).isLessThan(1_000);
    }
}

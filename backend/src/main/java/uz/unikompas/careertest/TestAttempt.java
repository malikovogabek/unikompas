package uz.unikompas.careertest;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Stored result of one questionnaire run: normalised RIASEC scores (0..1) and the Holland code.
 */
@Entity
@Table(name = "test_attempts")
@Getter
@NoArgsConstructor
public class TestAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private Long userId;

    @Column(name = "score_r", nullable = false, precision = 4, scale = 3)
    private BigDecimal scoreR;
    @Column(name = "score_i", nullable = false, precision = 4, scale = 3)
    private BigDecimal scoreI;
    @Column(name = "score_a", nullable = false, precision = 4, scale = 3)
    private BigDecimal scoreA;
    @Column(name = "score_s", nullable = false, precision = 4, scale = 3)
    private BigDecimal scoreS;
    @Column(name = "score_e", nullable = false, precision = 4, scale = 3)
    private BigDecimal scoreE;
    @Column(name = "score_c", nullable = false, precision = 4, scale = 3)
    private BigDecimal scoreC;

    @Column(nullable = false, length = 3)
    private String hollandCode;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public TestAttempt(Long userId, double[] vector) {
        this.userId = userId;
        this.scoreR = round(vector[0]);
        this.scoreI = round(vector[1]);
        this.scoreA = round(vector[2]);
        this.scoreS = round(vector[3]);
        this.scoreE = round(vector[4]);
        this.scoreC = round(vector[5]);
        this.hollandCode = Riasec.hollandCode(vector);
    }

    /** Scores in R, I, A, S, E, C order. */
    public double[] vector() {
        return new double[] {scoreR.doubleValue(), scoreI.doubleValue(), scoreA.doubleValue(),
                scoreS.doubleValue(), scoreE.doubleValue(), scoreC.doubleValue()};
    }

    private static BigDecimal round(double v) {
        return BigDecimal.valueOf(v).setScale(3, RoundingMode.HALF_UP);
    }
}

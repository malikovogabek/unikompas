package uz.unikompas.careertest.dto;

import java.math.BigDecimal;
import java.time.Instant;

import uz.unikompas.careertest.TestAttempt;

/** RIASEC result: scores 0..1 per type and the three-letter Holland code. */
public record TestResultResponse(Long id, Scores scores, String hollandCode, Instant createdAt) {

    public record Scores(BigDecimal r, BigDecimal i, BigDecimal a, BigDecimal s, BigDecimal e, BigDecimal c) {
    }

    public static TestResultResponse from(TestAttempt t) {
        return new TestResultResponse(t.getId(),
                new Scores(t.getScoreR(), t.getScoreI(), t.getScoreA(), t.getScoreS(), t.getScoreE(), t.getScoreC()),
                t.getHollandCode(), t.getCreatedAt());
    }
}

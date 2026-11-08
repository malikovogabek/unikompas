package uz.unikompas.recommendation;

import java.util.List;
import java.util.OptionalDouble;

/**
 * Admission chance model (TZ §6.3 b).
 * <ol>
 *   <li>Forecast next year's passing score from up to the last 3 known years:
 *       {@code Δ = clamp((P_last − P_first)/(n − 1), −10, +10)}, {@code P̂ = P_last + Δ}.</li>
 *   <li>Probability via a logistic curve: {@code p = 1 / (1 + e^(−(S − P̂)/k))}, {@code k = 4}.
 *       {@code S = P̂ → 0.5}; 10 points above → ≈ 0.92; 10 below → ≈ 0.08.</li>
 * </ol>
 */
public final class ChanceEstimator {

    static final int HISTORY_YEARS = 3;
    static final double MAX_YEARLY_TREND = 10;
    static final double SPREAD_K = 4;

    private ChanceEstimator() {
    }

    /** Average yearly change over the last {@value #HISTORY_YEARS} values, clamped to ±10. */
    public static double trend(List<Double> chronological) {
        List<Double> recent = recent(chronological);
        if (recent.size() < 2) {
            return 0;
        }
        double raw = (recent.getLast() - recent.getFirst()) / (recent.size() - 1);
        return Math.max(-MAX_YEARLY_TREND, Math.min(MAX_YEARLY_TREND, raw));
    }

    /**
     * @param chronological known passing scores, oldest first (no nulls)
     * @return forecast for the coming admission, or empty if there is no history
     */
    public static OptionalDouble forecast(List<Double> chronological) {
        if (chronological.isEmpty()) {
            return OptionalDouble.empty();
        }
        return OptionalDouble.of(chronological.getLast() + trend(chronological));
    }

    public static double probability(double expectedScore, double forecast) {
        return 1 / (1 + Math.exp(-(expectedScore - forecast) / SPREAD_K));
    }

    private static List<Double> recent(List<Double> chronological) {
        int from = Math.max(0, chronological.size() - HISTORY_YEARS);
        return chronological.subList(from, chronological.size());
    }
}

package uz.unikompas.recommendation;

import java.util.List;
import java.util.OptionalDouble;

/**
 * Admission chance model (TZ §6.3 b). Works on <b>calendar years</b>, so gaps in the
 * data (a year without published scores) do not distort the trend.
 * <ol>
 *   <li>Trend over the known values within the last {@value #HISTORY_YEARS} calendar years:
 *       {@code Δ = clamp((P_last − P_first) / (year_last − year_first), −10, +10)} per year.</li>
 *   <li>Forecast for the target year: {@code P̂ = P_last + Δ · (target − year_last)}.
 *       History older than {@value #MAX_STALE_YEARS} years before the target is ignored.</li>
 *   <li>Probability via a logistic curve: {@code p = 1 / (1 + e^(−(S − P̂)/k))}, {@code k = 4}.</li>
 * </ol>
 */
public final class ChanceEstimator {

    static final int HISTORY_YEARS = 3;
    static final int MAX_STALE_YEARS = 3;
    static final double MAX_YEARLY_TREND = 10;
    static final double SPREAD_K = 4;

    private ChanceEstimator() {
    }

    /**
     * Average yearly change, clamped to ±10.
     *
     * @param chronological known scores, oldest year first, one entry per year
     */
    public static double trend(List<YearScore> chronological) {
        if (chronological.size() < 2) {
            return 0;
        }
        YearScore last = chronological.getLast();
        YearScore first = chronological.stream()
                .filter(s -> s.year() > last.year() - HISTORY_YEARS)
                .findFirst().orElse(last);
        if (first.year() == last.year()) {
            return 0;
        }
        double raw = (last.score() - first.score()) / (last.year() - first.year());
        return Math.max(-MAX_YEARLY_TREND, Math.min(MAX_YEARLY_TREND, raw));
    }

    /**
     * @return forecast passing score for {@code targetYear}, or empty when there is
     *         no history or it is too old to be meaningful
     */
    public static OptionalDouble forecast(List<YearScore> chronological, int targetYear) {
        if (chronological.isEmpty()) {
            return OptionalDouble.empty();
        }
        YearScore last = chronological.getLast();
        int gap = Math.max(1, targetYear - last.year());
        if (gap > MAX_STALE_YEARS) {
            return OptionalDouble.empty();
        }
        return OptionalDouble.of(last.score() + trend(chronological) * gap);
    }

    public static double probability(double expectedScore, double forecast) {
        return 1 / (1 + Math.exp(-(expectedScore - forecast) / SPREAD_K));
    }
}

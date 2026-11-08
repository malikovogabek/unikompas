package uz.unikompas.recommendation;

/**
 * Weights of the final score (TZ §6.4): {@code w1·I + w2·C + w3·P + w4·R}, summing to 1.
 */
public record RecommendationWeights(double interest, double chance, double preference, double rating) {

    public static final RecommendationWeights DEFAULT = new RecommendationWeights(0.35, 0.35, 0.15, 0.15);
    static final double SUM_TOLERANCE = 0.001;

    public RecommendationWeights {
        for (double w : new double[] {interest, chance, preference, rating}) {
            if (w < 0 || w > 1 || Double.isNaN(w)) {
                throw new IllegalArgumentException("Each weight must be within [0, 1]");
            }
        }
        if (Math.abs(interest + chance + preference + rating - 1) > SUM_TOLERANCE) {
            throw new IllegalArgumentException("Weights must sum to 1");
        }
    }
}

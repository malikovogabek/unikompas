package uz.unikompas.recommendation;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.OptionalDouble;

import uz.unikompas.profile.Financing;

/**
 * Hybrid, explainable, content-based recommender (TZ §6). Pure and stateless (no Spring,
 * JPA or HTTP dependencies): the same input always gives the same ranking, which makes it
 * fully unit-testable. Registered as a bean in {@link RecommendationConfig}.
 *
 * <pre>
 * 1. hard filters   — subject pair, language, form, region (if not relocating), financing/budget
 * 2. criteria       — I interest, C chance, P preference, R rating, each in [0, 1]
 * 3. total          — w1·I + w2·C + w3·P + w4·R
 * 4. categorise     — SAFE / TARGET / REACH by C; C &lt; 0.15 is dropped
 * 5. explain        — reasons with parameters for the client to render
 * </pre>
 */
public class RecommendationEngine {

    /**
     * Contract places are valued lower than a state grant (TZ §6.3 b). Contract passing scores
     * are typically far below grant ones, so with a mild discount almost every affordable program
     * would land in SAFE and the bands would stop carrying information. At 0.70 a contract-only
     * path tops out at TARGET ("Maqbul"); SAFE ("Ishonchli") requires a likely grant.
     */
    static final double CONTRACT_DISCOUNT = 0.70;
    /** Interest when no test was taken and the field matches / does not / no fields chosen. */
    static final double COLD_START_FIELD_MATCH = 1.0;
    static final double COLD_START_FIELD_MISS = 0.3;
    static final double NEUTRAL = 0.5;
    static final double OTHER_REGION = 0.5;
    /** TZ §6.6: the interest reason is shown from I ≥ 0.8. */
    static final double HIGH_INTEREST = 0.8;
    static final double FLAT_VECTOR_VARIANCE = 1e-9;
    static final double LIKELY = 0.5;
    static final double RISING_TREND = 3;
    static final int HIGH_RATING = 85;

    /**
     * @param targetYear admission year to forecast passing scores for
     */
    public List<ScoredProgram> score(ApplicantInput in, List<ProgramCandidate> candidates, RecommendationWeights w,
                                     int targetYear) {
        List<ScoredProgram> result = new ArrayList<>();
        for (ProgramCandidate p : candidates) {
            ScoredProgram scored = scoreOne(in, p, w, targetYear);
            if (scored != null) {
                result.add(scored);
            }
        }
        result.sort(Comparator.comparingDouble(ScoredProgram::total).reversed()
                .thenComparing(Comparator.comparingDouble(ScoredProgram::chance).reversed())
                .thenComparingLong(s -> s.candidate().programId()));
        return result;
    }

    private ScoredProgram scoreOne(ApplicantInput in, ProgramCandidate p, RecommendationWeights w, int targetYear) {
        // ---- 1. Hard filters (TZ §6.2) ------------------------------------
        if (p.firstSubjectId() != in.firstSubjectId() || p.secondSubjectId() != in.secondSubjectId()) {
            return null;
        }
        if (in.language() != null && in.language() != p.language()) {
            return null;
        }
        if (in.studyForm() != null && in.studyForm() != p.studyForm()) {
            return null;
        }
        boolean sameRegion = p.universityRegionId() == in.regionId();
        if (!in.willingToRelocate() && !sameRegion) {
            return null;
        }
        OptionalDouble grantForecast = ChanceEstimator.forecast(p.grantHistory(), targetYear);
        OptionalDouble contractForecast = ChanceEstimator.forecast(p.contractHistory(), targetYear);
        boolean grantAllowed = p.grantQuota() > 0 && grantForecast.isPresent();
        boolean withinBudget = in.maxContractFee() == null || p.contractFee() <= in.maxContractFee();
        boolean contractAllowed = in.financing() == Financing.CONTRACT_OK && p.contractQuota() > 0
                && contractForecast.isPresent() && withinBudget;
        if (!grantAllowed && !contractAllowed) {
            return null;
        }

        // ---- 2. Criteria ---------------------------------------------------
        double pGrant = grantAllowed ? ChanceEstimator.probability(in.expectedScore(), grantForecast.getAsDouble()) : 0;
        double pContract = contractAllowed
                ? ChanceEstimator.probability(in.expectedScore(), contractForecast.getAsDouble()) : 0;
        double chance = Math.max(pGrant, CONTRACT_DISCOUNT * pContract);
        // Which financing path determines C — used for trend warnings.
        boolean viaGrant = grantAllowed && pGrant >= CONTRACT_DISCOUNT * pContract;
        Category category = Category.of(chance);
        if (category == null) {
            return null;
        }

        boolean noFieldsChosen = in.fieldIds() == null || in.fieldIds().isEmpty();
        boolean fieldMatch = !noFieldsChosen && in.fieldIds().contains(p.fieldId());
        double fieldScore = noFieldsChosen ? NEUTRAL : (fieldMatch ? 1 : 0);
        // A flat test result (all answers equal) carries no signal: fall back to chosen fields.
        boolean usedTest = in.riasec() != null && !isFlat(in.riasec());
        double interest = usedTest
                ? interestSimilarity(in.riasec(), p.directionRiasec())
                : (noFieldsChosen ? NEUTRAL : (fieldMatch ? COLD_START_FIELD_MATCH : COLD_START_FIELD_MISS));
        double preference = 0.6 * (sameRegion ? 1 : OTHER_REGION) + 0.4 * fieldScore;
        double rating = p.universityRating() / 100.0;

        // ---- 3. Weighted total --------------------------------------------
        double total = w.interest() * interest + w.chance() * chance + w.preference() * preference
                + w.rating() * rating;

        // ---- 5. Explanations (TZ §6.6) ------------------------------------
        List<Reason> reasons = new ArrayList<>();
        if (usedTest && interest >= HIGH_INTEREST) {
            reasons.add(Reason.of("INTEREST_MATCH", params("percent", pct(interest), "hollandCode", in.hollandCode())));
        }
        if (fieldMatch) {
            reasons.add(Reason.of("FIELD_MATCH"));
        }
        if (grantAllowed) {
            double diff = round1(in.expectedScore() - grantForecast.getAsDouble());
            if (diff >= 0) {
                reasons.add(Reason.of("ABOVE_GRANT", params("diff", diff)));
            } else if (pContract >= LIKELY) {
                reasons.add(Reason.of("BELOW_GRANT_CONTRACT_LIKELY", params("diff", -diff)));
            } else {
                reasons.add(Reason.of("BELOW_GRANT", params("diff", -diff)));
            }
        } else {
            reasons.add(Reason.of("CONTRACT_ONLY",
                    params("diff", round1(in.expectedScore() - contractForecast.getAsDouble()))));
        }
        if (sameRegion) {
            reasons.add(Reason.of("SAME_REGION"));
        }
        if (contractAllowed && in.maxContractFee() != null) {
            reasons.add(Reason.of("WITHIN_BUDGET", params("fee", p.contractFee())));
        }
        double trend = ChanceEstimator.trend(viaGrant ? p.grantHistory() : p.contractHistory());
        if (trend > RISING_TREND) {
            reasons.add(Reason.of("RISING_TREND", params("delta", round1(trend))));
        }
        if (p.universityRating() >= HIGH_RATING) {
            reasons.add(Reason.of("HIGH_RATING", params("rating", p.universityRating())));
        }

        return new ScoredProgram(p, interest, chance, preference, rating, total, category,
                grantAllowed ? pGrant : null, contractAllowed ? pContract : null,
                grantAllowed ? round1(grantForecast.getAsDouble()) : null,
                contractAllowed ? round1(contractForecast.getAsDouble()) : null,
                List.copyOf(reasons));
    }

    /**
     * Centred cosine similarity (Pearson correlation) mapped to [0, 1].
     * Plain cosine is almost always 0.7–0.95 for all-positive RIASEC vectors and barely
     * separates directions; centring each vector on its mean compares the <i>shape</i>
     * of the profiles. A flat (uninformative) vector yields the neutral 0.5.
     */
    static double interestSimilarity(double[] u, double[] d) {
        double mu = mean(u);
        double md = mean(d);
        double dot = 0;
        double nu = 0;
        double nd = 0;
        for (int k = 0; k < 6; k++) {
            double a = u[k] - mu;
            double b = d[k] - md;
            dot += a * b;
            nu += a * a;
            nd += b * b;
        }
        if (nu < 1e-12 || nd < 1e-12) {
            return NEUTRAL;
        }
        return (dot / Math.sqrt(nu * nd) + 1) / 2;
    }

    static boolean isFlat(double[] v) {
        double m = mean(v);
        double var = 0;
        for (double x : v) {
            var += (x - m) * (x - m);
        }
        return var < FLAT_VECTOR_VARIANCE;
    }

    private static double mean(double[] v) {
        double s = 0;
        for (double x : v) {
            s += x;
        }
        return s / v.length;
    }

    private static int pct(double v) {
        return (int) Math.round(v * 100);
    }

    static double round1(double v) {
        return Math.round(v * 10) / 10.0;
    }

    private static Map<String, Object> params(Object... kv) {
        Map<String, Object> m = new LinkedHashMap<>();
        for (int i = 0; i < kv.length; i += 2) {
            if (kv[i + 1] != null) {
                m.put((String) kv[i], kv[i + 1]);
            }
        }
        return m;
    }
}

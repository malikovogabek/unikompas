package uz.unikompas.careertest;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

/**
 * Turns Likert answers (1..5) into a normalised RIASEC vector (FR-4.2).
 * For each type: {@code score = (sum − n) / (4n)}, i.e. 0 when every item is 1
 * ("strongly disagree") and 1 when every item is 5.
 */
@Component
public class RiasecScorer {

    public static final int MIN_ANSWER = 1;
    public static final int MAX_ANSWER = 5;

    /**
     * @param questions all questionnaire items
     * @param answers   question id → answer; must cover every question exactly
     */
    public double[] score(List<CareerQuestion> questions, Map<Long, Integer> answers) {
        double[] sums = new double[6];
        int[] counts = new int[6];
        for (CareerQuestion q : questions) {
            int type = Riasec.TYPES.indexOf(q.getRiasecType());
            sums[type] += answers.get(q.getId());
            counts[type]++;
        }
        double[] vector = new double[6];
        for (int t = 0; t < 6; t++) {
            vector[t] = counts[t] == 0 ? 0 : (sums[t] - counts[t]) / ((MAX_ANSWER - MIN_ANSWER) * (double) counts[t]);
        }
        return vector;
    }
}

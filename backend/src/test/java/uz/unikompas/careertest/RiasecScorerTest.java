package uz.unikompas.careertest;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

class RiasecScorerTest {

    private final RiasecScorer scorer = new RiasecScorer();

    @Test
    void shouldNormaliseLikertAnswersPerType() throws Exception {
        List<CareerQuestion> questions = new ArrayList<>();
        Map<Long, Integer> answers = new HashMap<>();
        long id = 1;
        for (char type : Riasec.TYPES.toCharArray()) {
            for (int k = 0; k < 6; k++) {
                questions.add(question(id, type));
                // R: all 5, I: all 1, others: all 3
                answers.put(id, type == 'R' ? 5 : type == 'I' ? 1 : 3);
                id++;
            }
        }
        double[] v = scorer.score(questions, answers);
        assertThat(v).containsExactly(1.0, 0.0, 0.5, 0.5, 0.5, 0.5);
    }

    private static CareerQuestion question(long id, char type) throws Exception {
        CareerQuestion q = new CareerQuestion();
        set(q, "id", id);
        set(q, "riasecType", type);
        return q;
    }

    private static void set(Object target, String name, Object value) throws Exception {
        Field f = CareerQuestion.class.getDeclaredField(name);
        f.setAccessible(true);
        f.set(target, value);
    }
}

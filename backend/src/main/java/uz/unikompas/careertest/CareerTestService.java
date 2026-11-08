package uz.unikompas.careertest;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.unikompas.careertest.dto.QuestionResponse;
import uz.unikompas.careertest.dto.SubmitTestRequest;
import uz.unikompas.careertest.dto.TestResultResponse;
import uz.unikompas.common.exception.FieldValidationException;
import uz.unikompas.common.exception.NotFoundException;

/**
 * RIASEC questionnaire (module M4): serve items, score submissions, keep history.
 */
@Service
@RequiredArgsConstructor
public class CareerTestService {

    private final CareerQuestionRepository questions;
    private final TestAttemptRepository attempts;
    private final RiasecScorer scorer;

    @Transactional(readOnly = true)
    public List<QuestionResponse> questions() {
        return questions.findAllByOrderByOrderNoAsc().stream().map(QuestionResponse::from).toList();
    }

    @Transactional
    public TestResultResponse submit(Long userId, SubmitTestRequest req) {
        List<CareerQuestion> all = questions.findAll();
        Map<Long, Integer> answers = new HashMap<>();
        for (SubmitTestRequest.Answer a : req.answers()) {
            if (answers.put(a.questionId(), a.value()) != null) {
                throw FieldValidationException.of("answers", "Duplicate");
            }
        }
        // Every question answered, and nothing else.
        boolean exactCover = answers.size() == all.size()
                && all.stream().allMatch(q -> answers.containsKey(q.getId()));
        if (!exactCover) {
            throw FieldValidationException.of("answers", "AllQuestionsRequired");
        }
        TestAttempt attempt = attempts.save(new TestAttempt(userId, scorer.score(all, answers)));
        return TestResultResponse.from(attempt);
    }

    @Transactional(readOnly = true)
    public TestResultResponse latest(Long userId) {
        return latestAttempt(userId).map(TestResultResponse::from)
                .orElseThrow(() -> new NotFoundException("Test result for user", userId));
    }

    @Transactional(readOnly = true)
    public List<TestResultResponse> history(Long userId) {
        return attempts.findTop20ByUserIdOrderByCreatedAtDescIdDesc(userId).stream()
                .map(TestResultResponse::from).toList();
    }

    /** Latest attempt, used by the recommendation engine (absent → cold start). */
    @Transactional(readOnly = true)
    public Optional<TestAttempt> latestAttempt(Long userId) {
        return attempts.findFirstByUserIdOrderByCreatedAtDescIdDesc(userId);
    }
}

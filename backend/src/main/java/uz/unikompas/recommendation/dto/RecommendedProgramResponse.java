package uz.unikompas.recommendation.dto;

import java.math.BigDecimal;
import java.util.List;

import uz.unikompas.direction.dto.DirectionResponse;
import uz.unikompas.program.StudyForm;
import uz.unikompas.program.StudyLanguage;
import uz.unikompas.recommendation.Category;
import uz.unikompas.recommendation.Reason;
import uz.unikompas.university.dto.UniversityResponse;

/**
 * A recommended program with its score breakdown (each 0..1) and explanations.
 */
public record RecommendedProgramResponse(
        Long programId, int rank, Category category, UniversityResponse university, DirectionResponse direction,
        StudyLanguage language, StudyForm studyForm, int grantQuota, int contractQuota, long contractFee,
        Scores scores, BigDecimal predictedGrantScore, BigDecimal predictedContractScore, List<Reason> reasons) {

    /**
     * Criteria (0..1). {@code chance} is the combined C; {@code grantChance}/{@code contractChance}
     * are the per-financing probabilities ({@code null} = not an option for this applicant).
     */
    public record Scores(BigDecimal total, BigDecimal interest, BigDecimal chance, BigDecimal preference,
                         BigDecimal rating, BigDecimal grantChance, BigDecimal contractChance) {
    }
}

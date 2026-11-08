package uz.unikompas.recommendation;

import java.util.List;

import uz.unikompas.program.StudyForm;
import uz.unikompas.program.StudyLanguage;

/**
 * Flattened program data for scoring. Histories are chronological, one entry per year,
 * and contain only years with a published score.
 */
public record ProgramCandidate(
        long programId, long directionId, long fieldId, long firstSubjectId, long secondSubjectId,
        double[] directionRiasec, long universityRegionId, int universityRating,
        StudyLanguage language, StudyForm studyForm, int grantQuota, int contractQuota, long contractFee,
        List<YearScore> grantHistory, List<YearScore> contractHistory) {
}

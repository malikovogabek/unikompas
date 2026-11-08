package uz.unikompas.recommendation;

import java.util.List;

import uz.unikompas.program.StudyForm;
import uz.unikompas.program.StudyLanguage;

/**
 * Flattened program data for scoring. Histories are chronological and contain only known values.
 */
public record ProgramCandidate(
        long programId, long directionId, long fieldId, long firstSubjectId, long secondSubjectId,
        double[] directionRiasec, long universityRegionId, int universityRating,
        StudyLanguage language, StudyForm studyForm, int grantQuota, int contractQuota, long contractFee,
        List<Double> grantHistory, List<Double> contractHistory) {
}

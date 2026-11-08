package uz.unikompas.recommendation;

import java.math.BigDecimal;
import java.util.List;

/**
 * JSON-serialised copy of the inputs used for a recommendation.
 */
record InputSnapshot(
        BigDecimal expectedScore, long regionId, long firstSubjectId, long secondSubjectId,
        String preferredLanguage, String preferredStudyForm, String financing, Long maxContractFee,
        boolean willingToRelocate, List<Long> fieldIds, double[] riasec, String hollandCode) {
}

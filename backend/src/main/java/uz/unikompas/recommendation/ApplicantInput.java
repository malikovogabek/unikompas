package uz.unikompas.recommendation;

import java.util.Set;

import uz.unikompas.profile.Financing;
import uz.unikompas.program.StudyForm;
import uz.unikompas.program.StudyLanguage;

/**
 * Everything the engine needs about the applicant, decoupled from JPA entities.
 *
 * @param riasec      normalised RIASEC vector from the latest test, or {@code null} (cold start)
 * @param hollandCode Holland code of that test, or {@code null}
 * @param language    preferred language, {@code null} = any
 * @param studyForm   preferred study form, {@code null} = any
 * @param maxContractFee yearly budget in UZS, {@code null} = unlimited
 */
public record ApplicantInput(
        double expectedScore, long firstSubjectId, long secondSubjectId, long regionId,
        StudyLanguage language, StudyForm studyForm, Financing financing, Long maxContractFee,
        boolean willingToRelocate, Set<Long> fieldIds, double[] riasec, String hollandCode) {
}

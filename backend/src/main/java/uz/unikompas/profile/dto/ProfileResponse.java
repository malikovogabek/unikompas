package uz.unikompas.profile.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;

import uz.unikompas.profile.ApplicantProfile;
import uz.unikompas.profile.Financing;
import uz.unikompas.program.StudyForm;
import uz.unikompas.program.StudyLanguage;
import uz.unikompas.reference.dto.RefResponse;

/**
 * Applicant profile. {@code complete} tells the client whether recommendations can be generated.
 */
public record ProfileResponse(
        RefResponse region, RefResponse firstSubject, RefResponse secondSubject, BigDecimal expectedScore,
        StudyLanguage preferredLanguage, StudyForm preferredStudyForm, Financing financing, Long maxContractFee,
        boolean willingToRelocate, List<RefResponse> fields, boolean complete, Instant updatedAt) {

    /** Profile of a user who has not saved anything yet. */
    public static ProfileResponse empty() {
        return new ProfileResponse(null, null, null, null, null, null, Financing.CONTRACT_OK, null,
                true, List.of(), false, null);
    }

    public static ProfileResponse from(ApplicantProfile p) {
        return new ProfileResponse(
                p.getRegion() == null ? null : RefResponse.of(p.getRegion()),
                p.getFirstSubject() == null ? null : RefResponse.of(p.getFirstSubject()),
                p.getSecondSubject() == null ? null : RefResponse.of(p.getSecondSubject()),
                p.getExpectedScore(), p.getPreferredLanguage(), p.getPreferredStudyForm(), p.getFinancing(),
                p.getMaxContractFee(), p.isWillingToRelocate(),
                p.getFields().stream().sorted(Comparator.comparing(f -> f.getId())).map(RefResponse::of).toList(),
                p.isComplete(), p.getUpdatedAt());
    }
}

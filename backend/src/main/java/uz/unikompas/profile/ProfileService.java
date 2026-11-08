package uz.unikompas.profile;

import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.unikompas.common.exception.FieldValidationException;
import uz.unikompas.profile.dto.ProfileResponse;
import uz.unikompas.profile.dto.ProfileUpdateRequest;
import uz.unikompas.reference.Field;
import uz.unikompas.reference.FieldRepository;
import uz.unikompas.reference.RegionRepository;
import uz.unikompas.reference.SubjectRepository;

/**
 * Applicant profile read/upsert (FR-2.1–FR-2.7).
 */
@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ApplicantProfileRepository profiles;
    private final RegionRepository regions;
    private final SubjectRepository subjects;
    private final FieldRepository fields;

    @Transactional(readOnly = true)
    public ProfileResponse get(Long userId) {
        return profiles.findByUserId(userId).map(ProfileResponse::from).orElseGet(ProfileResponse::empty);
    }

    @Transactional
    public ProfileResponse update(Long userId, ProfileUpdateRequest req) {
        Map<String, String> errors = new LinkedHashMap<>();
        if (req.firstSubjectId().equals(req.secondSubjectId())) {
            errors.put("secondSubjectId", "DistinctSubjects");
        }
        var region = regions.findById(req.regionId());
        var first = subjects.findById(req.firstSubjectId());
        var second = subjects.findById(req.secondSubjectId());
        if (region.isEmpty()) {
            errors.put("regionId", "Exists");
        }
        if (first.isEmpty()) {
            errors.put("firstSubjectId", "Exists");
        }
        if (second.isEmpty()) {
            errors.putIfAbsent("secondSubjectId", "Exists");
        }
        Set<Long> fieldIds = req.fieldIds() == null ? Set.of() : req.fieldIds();
        List<Field> chosenFields = fields.findAllById(fieldIds);
        if (chosenFields.size() != fieldIds.size()) {
            errors.put("fieldIds", "Exists");
        }
        if (!errors.isEmpty()) {
            throw new FieldValidationException(errors);
        }

        ApplicantProfile p = profiles.findByUserId(userId).orElseGet(() -> new ApplicantProfile(userId));
        p.setRegion(region.get());
        p.setFirstSubject(first.get());
        p.setSecondSubject(second.get());
        p.setExpectedScore(req.expectedScore());
        p.setPreferredLanguage(req.preferredLanguage());
        p.setPreferredStudyForm(req.preferredStudyForm());
        p.setFinancing(req.financing());
        p.setMaxContractFee(req.maxContractFee());
        p.setWillingToRelocate(req.willingToRelocate());
        p.setFields(new HashSet<>(chosenFields));
        return ProfileResponse.from(profiles.saveAndFlush(p));
    }
}

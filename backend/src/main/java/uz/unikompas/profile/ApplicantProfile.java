package uz.unikompas.profile;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import uz.unikompas.program.StudyForm;
import uz.unikompas.program.StudyLanguage;
import uz.unikompas.reference.Field;
import uz.unikompas.reference.Region;
import uz.unikompas.reference.Subject;

/**
 * Applicant's inputs to the recommendation model (FR-2). One per user; created on first save.
 */
@Entity
@Table(name = "applicant_profiles")
@Getter
@Setter
@NoArgsConstructor
public class ApplicantProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, updatable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id")
    private Region region;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "first_subject_id")
    private Subject firstSubject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "second_subject_id")
    private Subject secondSubject;

    @Column(precision = 5, scale = 1)
    private BigDecimal expectedScore;

    @Enumerated(EnumType.STRING)
    @Column(length = 5)
    private StudyLanguage preferredLanguage;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private StudyForm preferredStudyForm;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Financing financing = Financing.CONTRACT_OK;

    /** Upper bound for a yearly contract fee in UZS; {@code null} = no limit. */
    private Long maxContractFee;

    @Column(nullable = false)
    private boolean willingToRelocate = true;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "profile_fields",
            joinColumns = @JoinColumn(name = "profile_id"),
            inverseJoinColumns = @JoinColumn(name = "field_id"))
    private Set<Field> fields = new HashSet<>();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    public ApplicantProfile(Long userId) {
        this.userId = userId;
    }

    @PreUpdate
    void touch() {
        updatedAt = Instant.now();
    }

    /** True when every field the recommendation engine requires is filled in. */
    public boolean isComplete() {
        return region != null && firstSubject != null && secondSubject != null && expectedScore != null;
    }
}

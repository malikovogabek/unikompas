package uz.unikompas.program;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import uz.unikompas.direction.Direction;
import uz.unikompas.university.University;

/**
 * A concrete admission offer: one direction at one university in a given
 * language and study form, with quotas and the yearly contract fee (UZS).
 */
@Entity
@Table(name = "programs")
@Getter
@Setter
@NoArgsConstructor
public class Program {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "university_id")
    private University university;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "direction_id")
    private Direction direction;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 5)
    private StudyLanguage language;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StudyForm studyForm;

    @Column(nullable = false)
    private int grantQuota;

    @Column(nullable = false)
    private int contractQuota;

    @Column(nullable = false)
    private long contractFee;

    @Column(nullable = false)
    private short durationYears;
}

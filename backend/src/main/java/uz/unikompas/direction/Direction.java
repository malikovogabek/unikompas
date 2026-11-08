package uz.unikompas.direction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
import uz.unikompas.reference.Field;
import uz.unikompas.reference.Subject;

/**
 * Bachelor study direction from the national classifier, with the subject pair
 * required at the entrance test and its RIASEC interest profile (each 0..10).
 */
@Entity
@Table(name = "directions")
@Getter
@Setter
@NoArgsConstructor
public class Direction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 12)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "field_id")
    private Field field;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "first_subject_id")
    private Subject firstSubject;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "second_subject_id")
    private Subject secondSubject;

    @Column(name = "riasec_r", nullable = false)
    private short riasecR;
    @Column(name = "riasec_i", nullable = false)
    private short riasecI;
    @Column(name = "riasec_a", nullable = false)
    private short riasecA;
    @Column(name = "riasec_s", nullable = false)
    private short riasecS;
    @Column(name = "riasec_e", nullable = false)
    private short riasecE;
    @Column(name = "riasec_c", nullable = false)
    private short riasecC;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String careerProspects;

    /** RIASEC vector in R, I, A, S, E, C order. */
    public double[] riasecVector() {
        return new double[] {riasecR, riasecI, riasecA, riasecS, riasecE, riasecC};
    }
}

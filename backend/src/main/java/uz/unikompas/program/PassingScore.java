package uz.unikompas.program;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Lowest admitted score of a program in a given year; {@code null} when that
 * financing type had no places (e.g. no grant at private universities).
 */
@Entity
@Table(name = "passing_scores")
@Getter
@Setter
@NoArgsConstructor
public class PassingScore {

    /** Pooled sequence (V7: INCREMENT BY 50) so CSV imports are sent as JDBC batches. */
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "passing_scores_seq")
    @SequenceGenerator(name = "passing_scores_seq", sequenceName = "passing_scores_id_seq", allocationSize = 50)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "program_id")
    private Program program;

    @Column(nullable = false)
    private short year;

    @Column(precision = 5, scale = 1)
    private BigDecimal grantScore;

    @Column(precision = 5, scale = 1)
    private BigDecimal contractScore;
}

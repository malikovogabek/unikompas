package uz.unikompas.recommendation;

import java.math.BigDecimal;
import java.math.RoundingMode;

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
import org.hibernate.annotations.ColumnTransformer;

/**
 * One scored program inside a recommendation. All scored programs are stored, so the
 * response (top directions + categories) can always be rebuilt identically.
 */
@Entity
@Table(name = "recommendation_items")
@Getter
@NoArgsConstructor
public class RecommendationItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recommendation_id")
    private Recommendation recommendation;

    @Column(nullable = false)
    private Long programId;

    @Column(nullable = false)
    private int rank;

    @Column(nullable = false, precision = 5, scale = 4)
    private BigDecimal totalScore;
    @Column(nullable = false, precision = 5, scale = 4)
    private BigDecimal interestScore;
    @Column(nullable = false, precision = 5, scale = 4)
    private BigDecimal chanceScore;
    @Column(nullable = false, precision = 5, scale = 4)
    private BigDecimal preferenceScore;
    @Column(nullable = false, precision = 5, scale = 4)
    private BigDecimal ratingScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Category category;

    /** Probability via grant / contract; {@code null} when that financing is not an option. */
    @Column(precision = 5, scale = 4)
    private BigDecimal grantChance;
    @Column(precision = 5, scale = 4)
    private BigDecimal contractChance;

    @Column(precision = 5, scale = 1)
    private BigDecimal predictedGrantScore;
    @Column(precision = 5, scale = 1)
    private BigDecimal predictedContractScore;

    /** JSON array of {@link Reason}. */
    @Column(nullable = false, columnDefinition = "jsonb")
    @ColumnTransformer(write = "?::jsonb")
    private String reasons;

    public RecommendationItem(Recommendation recommendation, int rank, ScoredProgram s, String reasonsJson) {
        this.recommendation = recommendation;
        this.programId = s.candidate().programId();
        this.rank = rank;
        this.totalScore = unit(s.total());
        this.interestScore = unit(s.interest());
        this.chanceScore = unit(s.chance());
        this.preferenceScore = unit(s.preference());
        this.ratingScore = unit(s.rating());
        this.category = s.category();
        this.grantChance = s.grantChance() == null ? null : unit(s.grantChance());
        this.contractChance = s.contractChance() == null ? null : unit(s.contractChance());
        this.predictedGrantScore = s.predictedGrantScore() == null ? null : BigDecimal.valueOf(s.predictedGrantScore());
        this.predictedContractScore =
                s.predictedContractScore() == null ? null : BigDecimal.valueOf(s.predictedContractScore());
        this.reasons = reasonsJson;
    }

    private static BigDecimal unit(double v) {
        return BigDecimal.valueOf(v).setScale(4, RoundingMode.HALF_UP);
    }
}

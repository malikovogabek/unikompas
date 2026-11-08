package uz.unikompas.recommendation;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnTransformer;

/**
 * One generated recommendation with the exact inputs and weights used (for reproducibility
 * and for the diploma's experimental chapter).
 */
@Entity
@Table(name = "recommendations")
@Getter
@NoArgsConstructor
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private Long userId;

    /** JSON: profile fields, RIASEC vector and Holland code at generation time. */
    @Column(nullable = false, columnDefinition = "jsonb")
    @ColumnTransformer(write = "?::jsonb")
    private String inputSnapshot;

    /** JSON: the four weights applied. */
    @Column(nullable = false, columnDefinition = "jsonb")
    @ColumnTransformer(write = "?::jsonb")
    private String weights;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Recommendation(Long userId, String inputSnapshot, String weights) {
        this.userId = userId;
        this.inputSnapshot = inputSnapshot;
        this.weights = weights;
    }
}

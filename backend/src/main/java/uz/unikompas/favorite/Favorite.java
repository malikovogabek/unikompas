package uz.unikompas.favorite;

import java.io.Serializable;
import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * A program saved by an applicant (FR-7.1).
 */
@Entity
@Table(name = "favorites")
@IdClass(Favorite.Key.class)
@Getter
@NoArgsConstructor
public class Favorite {

    @Id
    private Long userId;

    @Id
    private Long programId;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Favorite(Long userId, Long programId) {
        this.userId = userId;
        this.programId = programId;
    }

    public record Key(Long userId, Long programId) implements Serializable {
    }
}

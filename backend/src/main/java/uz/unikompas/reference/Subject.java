package uz.unikompas.reference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Reference data (read-only). {@code code} is the stable key the frontend uses for translations.
 */
@Entity
@Table(name = "subjects")
@Getter
@NoArgsConstructor
public class Subject {

    @Id
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(nullable = false, length = 80)
    private String name;
}

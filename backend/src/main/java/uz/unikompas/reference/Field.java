package uz.unikompas.reference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Knowledge area (IT, medicine, economics...) grouping study directions.
 */
@Entity
@Table(name = "fields")
@Getter
@NoArgsConstructor
public class Field {

    @Id
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(nullable = false, length = 120)
    private String name;

    /** lucide-react icon name used by the UI. */
    @Column(length = 40)
    private String icon;
}

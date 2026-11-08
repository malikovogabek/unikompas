package uz.unikompas.university;

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
import uz.unikompas.reference.Region;

/**
 * Higher education institution (OTM).
 */
@Entity
@Table(name = "universities")
@Getter
@Setter
@NoArgsConstructor
public class University {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 40)
    private String shortName;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "region_id")
    private Region region;

    @Column(length = 80)
    private String city;

    @Column(length = 250)
    private String address;

    @Column(length = 200)
    private String website;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UniversityType type;

    /** 0..100, normalised to R = rating / 100 in the recommendation score (TZ §6.3 d). */
    @Column(nullable = false)
    private short rating;

    @Column(nullable = false)
    private boolean hasDormitory;

    private Short foundedYear;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 300)
    private String logoUrl;
}

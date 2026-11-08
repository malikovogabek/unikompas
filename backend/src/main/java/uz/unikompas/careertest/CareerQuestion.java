package uz.unikompas.careertest;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * One questionnaire item in three languages, measuring a single RIASEC type.
 */
@Entity
@Table(name = "career_questions")
@Getter
@NoArgsConstructor
public class CareerQuestion {

    @Id
    private Long id;

    @Column(nullable = false, length = 300)
    private String textUz;

    @Column(nullable = false, length = 300)
    private String textRu;

    @Column(nullable = false, length = 300)
    private String textEn;

    /** One of R, I, A, S, E, C. */
    @Column(nullable = false)
    private char riasecType;

    @Column(nullable = false, unique = true)
    private short orderNo;
}

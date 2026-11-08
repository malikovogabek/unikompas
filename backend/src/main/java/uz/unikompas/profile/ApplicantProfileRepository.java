package uz.unikompas.profile;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicantProfileRepository extends JpaRepository<ApplicantProfile, Long> {

    @EntityGraph(attributePaths = {"region", "firstSubject", "secondSubject", "fields"})
    Optional<ApplicantProfile> findByUserId(Long userId);
}

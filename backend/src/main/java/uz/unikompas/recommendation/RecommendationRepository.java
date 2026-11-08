package uz.unikompas.recommendation;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

    Optional<Recommendation> findByIdAndUserId(Long id, Long userId);

    Optional<Recommendation> findFirstByUserIdOrderByCreatedAtDescIdDesc(Long userId);

    List<Recommendation> findTop20ByUserIdOrderByCreatedAtDescIdDesc(Long userId);
}

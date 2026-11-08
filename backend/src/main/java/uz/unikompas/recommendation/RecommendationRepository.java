package uz.unikompas.recommendation;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

    Optional<Recommendation> findByIdAndUserId(Long id, Long userId);

    Optional<Recommendation> findFirstByUserIdOrderByCreatedAtDescIdDesc(Long userId);

    Page<Recommendation> findByUserIdOrderByCreatedAtDescIdDesc(Long userId, Pageable pageable);
}

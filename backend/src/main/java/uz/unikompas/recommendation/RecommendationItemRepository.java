package uz.unikompas.recommendation;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface RecommendationItemRepository extends JpaRepository<RecommendationItem, Long> {

    List<RecommendationItem> findByRecommendationIdOrderByRankAsc(Long recommendationId);

    /** Rows of [recommendationId, category, count] for history summaries. */
    @Query("""
            select i.recommendation.id, i.category, count(i) from RecommendationItem i
            where i.recommendation.id in :ids group by i.recommendation.id, i.category
            """)
    List<Object[]> countByCategory(Collection<Long> ids);
}

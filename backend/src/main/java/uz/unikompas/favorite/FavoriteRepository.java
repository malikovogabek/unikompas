package uz.unikompas.favorite;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FavoriteRepository extends JpaRepository<Favorite, Favorite.Key> {

    List<Favorite> findByUserIdOrderByCreatedAtDesc(Long userId);
}

package uz.unikompas.favorite;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface FavoriteRepository extends JpaRepository<Favorite, Favorite.Key> {

    Page<Favorite> findByUserIdOrderByCreatedAtDescProgramIdAsc(Long userId, Pageable pageable);

    @Query("select f.programId from Favorite f where f.userId = :userId")
    List<Long> findProgramIdsByUserId(Long userId);

    /** Atomic idempotent insert: concurrent duplicates are ignored by the database. */
    @Modifying
    @Query(value = "insert into favorites (user_id, program_id) values (:userId, :programId) on conflict do nothing",
            nativeQuery = true)
    void insertIgnoringDuplicate(Long userId, Long programId);
}

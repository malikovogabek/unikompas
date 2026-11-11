package uz.unikompas.user;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /**
     * Atomic sign-in bookkeeping: increments in SQL, so concurrent sign-ins never lose a count,
     * and only these two columns are written (no stale full-row update).
     */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("update User u set u.loginCount = u.loginCount + 1, u.lastSeenAt = :now where u.id = :id")
    int recordLogin(Long id, Instant now);

    /** Stamps activity unless it was already recorded after {@code staleBefore}; returns rows updated. */
    @Modifying
    @Query("update User u set u.lastSeenAt = :now where u.id = :id and (u.lastSeenAt is null or u.lastSeenAt < :staleBefore)")
    int recordSeen(Long id, Instant now, Instant staleBefore);
}

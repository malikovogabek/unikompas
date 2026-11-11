package uz.unikompas.user;

import java.time.Instant;
import java.util.Locale;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Registered account — either an applicant or an administrator.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String fullName;

    @Column(nullable = false, unique = true, length = 160)
    private String email;

    @Column(nullable = false, length = 100)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    /** Last activity in the app (sign-in or session restore); {@code null} = never since tracking began. */
    private Instant lastSeenAt;

    @Column(nullable = false)
    private int loginCount;

    /** Minimum gap between two "seen" writes caused by session restores. */
    public static final java.time.Duration SEEN_THROTTLE = java.time.Duration.ofMinutes(5);

    /** Records an explicit sign-in (login or registration). */
    public void recordLogin(Instant now) {
        loginCount++;
        lastSeenAt = now;
    }

    /**
     * Records activity from a restored session; returns {@code true} if the timestamp changed.
     * Throttled so frequent page loads do not turn every request into a database write.
     */
    public boolean recordSeen(Instant now) {
        if (lastSeenAt != null && lastSeenAt.plus(SEEN_THROTTLE).isAfter(now)) {
            return false;
        }
        lastSeenAt = now;
        return true;
    }

    /**
     * Single canonical e-mail form used by every write and lookup path.
     * Locale.ROOT avoids locale-specific casing (e.g. Turkish dotless i).
     * The database additionally enforces uniqueness on lower(email).
     */
    public static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    public User(String fullName, String email, String passwordHash, Role role) {
        this.fullName = fullName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
    }
}

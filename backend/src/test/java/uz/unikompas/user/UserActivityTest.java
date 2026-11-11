package uz.unikompas.user;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;

import org.junit.jupiter.api.Test;

class UserActivityTest {

    private final Instant t0 = Instant.parse("2026-11-11T10:00:00Z");

    @Test
    void shouldCountLoginsAndStampActivity() {
        User u = new User("A", "a@x.uz", "h", Role.APPLICANT);
        u.recordLogin(t0);
        u.recordLogin(t0.plusSeconds(60));
        assertThat(u.getLoginCount()).isEqualTo(2);
        assertThat(u.getLastSeenAt()).isEqualTo(t0.plusSeconds(60));
    }

    @Test
    void shouldThrottleSessionRestoreWrites() {
        User u = new User("A", "a@x.uz", "h", Role.APPLICANT);
        assertThat(u.recordSeen(t0)).isTrue();                    // first ever
        assertThat(u.recordSeen(t0.plusSeconds(120))).isFalse();  // within 5 min
        assertThat(u.getLastSeenAt()).isEqualTo(t0);
        assertThat(u.recordSeen(t0.plusSeconds(301))).isTrue();   // after 5 min
        assertThat(u.getLastSeenAt()).isEqualTo(t0.plusSeconds(301));
        assertThat(u.getLoginCount()).isZero();                   // restores are not sign-ins
    }
}

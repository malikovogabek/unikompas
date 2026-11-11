package uz.unikompas.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.Test;
import uz.unikompas.user.UserRepository;

class ActivityTrackerTest {

    private final Instant t0 = Instant.parse("2026-11-11T10:00:00Z");
    private final AtomicReference<Instant> now = new AtomicReference<>(t0);
    private final Clock clock = new Clock() {
        @Override public ZoneId getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(ZoneId zone) { return this; }
        @Override public Instant instant() { return now.get(); }
    };
    private final UserRepository users = mock(UserRepository.class);
    private final ActivityTracker tracker = new ActivityTracker(users, clock);

    @Test
    void shouldStampOncePerThrottleWindow_whenUserIsBusy() {
        assertThat(tracker.touch(7L)).isTrue();
        now.set(t0.plusSeconds(120));
        assertThat(tracker.touch(7L)).isFalse();      // within 5 min: no database round-trip
        now.set(t0.plusSeconds(301));
        assertThat(tracker.touch(7L)).isTrue();

        verify(users).recordSeen(7L, t0, t0.minusSeconds(300));
        verify(users).recordSeen(7L, t0.plusSeconds(301), t0.plusSeconds(1));
        verify(users, times(2)).recordSeen(eq(7L), any(), any());
    }

    @Test
    void shouldThrottleEachUserSeparately_andNeverCountActivityAsSignIn() {
        assertThat(tracker.touch(1L)).isTrue();
        assertThat(tracker.touch(2L)).isTrue();
        assertThat(tracker.touch(1L)).isFalse();
        verify(users).recordSeen(eq(1L), any(), any());
        verify(users).recordSeen(eq(2L), any(), any());
        verify(users, never()).recordLogin(any(), any());
    }
}

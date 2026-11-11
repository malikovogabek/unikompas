package uz.unikompas.security;

import java.time.Clock;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import uz.unikompas.user.User;
import uz.unikompas.user.UserRepository;

/**
 * Records "last seen" for authenticated users. An in-memory throttle skips the database for a
 * user stamped within {@link User#SEEN_THROTTLE}; the conditional SQL update guards the rest
 * (other instances, restarts) and writes only the {@code last_seen_at} column.
 */
@Component
public class ActivityTracker {

    private final UserRepository users;
    private final Clock clock;
    private final Map<Long, Instant> lastStamped = new ConcurrentHashMap<>();

    @Autowired
    public ActivityTracker(UserRepository users) {
        this(users, Clock.systemUTC());
    }

    ActivityTracker(UserRepository users, Clock clock) {
        this.users = users;
        this.clock = clock;
    }

    /** @return {@code true} if a database update was attempted */
    @Transactional
    public boolean touch(Long userId) {
        Instant now = clock.instant();
        Instant staleBefore = now.minus(User.SEEN_THROTTLE);
        Instant previous = lastStamped.get(userId);
        if (previous != null && previous.isAfter(staleBefore)) {
            return false;
        }
        lastStamped.put(userId, now);
        users.recordSeen(userId, now, staleBefore);
        return true;
    }
}

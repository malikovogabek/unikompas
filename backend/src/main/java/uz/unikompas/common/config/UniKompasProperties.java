package uz.unikompas.common.config;

import java.time.Duration;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Typed application settings bound from the {@code unikompas.*} namespace.
 */
@ConfigurationProperties(prefix = "unikompas")
public record UniKompasProperties(Jwt jwt, Cors cors, Admin admin, Seed seed) {

    /** @param secret Base64-encoded HMAC-SHA256 key; @param ttl token lifetime */
    public record Jwt(String secret, Duration ttl) {
    }

    public record Cors(List<String> allowedOrigins) {
    }

    /** Bootstrap administrator account; skipped when e-mail or password is blank. */
    public record Admin(String email, String password) {
    }

    /** @param demoUsers create a demo applicant account (local profile only) */
    public record Seed(boolean demoUsers) {
    }
}

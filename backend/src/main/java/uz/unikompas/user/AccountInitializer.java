package uz.unikompas.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import uz.unikompas.common.config.UniKompasProperties;

/**
 * Creates the bootstrap administrator (from {@code unikompas.admin.*}) and, in the
 * local profile, a demo applicant. Idempotent: existing accounts are left untouched.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AccountInitializer implements ApplicationRunner {

    static final String DEMO_EMAIL = "abituriyent@unikompas.uz";
    private static final String DEMO_PASSWORD = "Demo123!";

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final UniKompasProperties props;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        var admin = props.admin();
        if (admin != null && StringUtils.hasText(admin.email()) && StringUtils.hasText(admin.password())) {
            createIfMissing("Administrator", admin.email(), admin.password(), Role.ADMIN);
        } else {
            log.warn("No bootstrap admin configured (unikompas.admin.email/password are empty)");
        }
        if (props.seed() != null && props.seed().demoUsers()) {
            createIfMissing("Demo Abituriyent", DEMO_EMAIL, DEMO_PASSWORD, Role.APPLICANT);
        }
    }

    private void createIfMissing(String name, String email, String rawPassword, Role role) {
        String normalized = email.trim().toLowerCase();
        if (users.existsByEmail(normalized)) {
            return;
        }
        users.save(new User(name, normalized, passwordEncoder.encode(rawPassword), role));
        log.info("Created {} account {}", role, normalized);
    }
}

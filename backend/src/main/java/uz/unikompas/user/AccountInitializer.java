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
 * Provisions accounts from configuration on startup:
 * <ul>
 *   <li>the bootstrap administrator ({@code unikompas.admin.*}); its configured password is
 *       re-applied if it changed, so rotating {@code ADMIN_PASSWORD} takes effect on restart;</li>
 *   <li>a demo applicant when {@code unikompas.seed.demo-users=true} (local profile only),
 *       created once and never overwritten.</li>
 * </ul>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AccountInitializer implements ApplicationRunner {

    static final String DEMO_EMAIL = "abituriyent@unikompas.uz";

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final UniKompasProperties props;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        var admin = props.admin();
        if (admin != null && StringUtils.hasText(admin.email()) && StringUtils.hasText(admin.password())) {
            upsertAdmin(admin.email(), admin.password());
        } else {
            log.warn("No bootstrap admin configured (unikompas.admin.email/password are empty)");
        }

        var seed = props.seed();
        if (seed != null && seed.demoUsers()) {
            if (StringUtils.hasText(seed.demoPassword())) {
                createIfMissing("Demo Abituriyent", DEMO_EMAIL, seed.demoPassword());
            } else {
                log.warn("Demo users enabled but unikompas.seed.demo-password is empty; skipping");
            }
        }
    }

    private void upsertAdmin(String rawEmail, String rawPassword) {
        String email = User.normalizeEmail(rawEmail);
        users.findByEmail(email).ifPresentOrElse(existing -> {
            if (existing.getRole() != Role.ADMIN) {
                log.warn("Configured admin e-mail {} belongs to a {} account; leaving it unchanged",
                        email, existing.getRole());
            } else if (!passwordEncoder.matches(rawPassword, existing.getPasswordHash())) {
                existing.setPasswordHash(passwordEncoder.encode(rawPassword));
                log.info("Bootstrap admin password updated from configuration");
            }
        }, () -> {
            users.save(new User("Administrator", email, passwordEncoder.encode(rawPassword), Role.ADMIN));
            log.info("Created bootstrap admin {}", email);
        });
    }

    private void createIfMissing(String name, String rawEmail, String rawPassword) {
        String email = User.normalizeEmail(rawEmail);
        if (!users.existsByEmail(email)) {
            users.save(new User(name, email, passwordEncoder.encode(rawPassword), Role.APPLICANT));
            log.info("Created demo applicant {}", email);
        }
    }
}

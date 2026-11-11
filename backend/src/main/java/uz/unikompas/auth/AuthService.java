package uz.unikompas.auth;

import java.time.Instant;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.unikompas.auth.dto.AuthResponse;
import uz.unikompas.auth.dto.LoginRequest;
import uz.unikompas.auth.dto.RegisterRequest;
import uz.unikompas.auth.dto.UserResponse;
import uz.unikompas.common.exception.ApiException;
import uz.unikompas.common.exception.ErrorCode;
import uz.unikompas.common.exception.NotFoundException;
import uz.unikompas.security.JwtService;
import uz.unikompas.user.Role;
import uz.unikompas.user.User;
import uz.unikompas.user.UserRepository;

/**
 * Registration and login (FR-1.1, FR-1.2). Self-registration always creates an
 * {@link Role#APPLICANT}; administrators are provisioned by configuration.
 */
@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    /** Real BCrypt hash of a random value, checked when the e-mail is unknown (timing safety). */
    private final String dummyHash;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.dummyHash = passwordEncoder.encode(UUID.randomUUID().toString());
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = User.normalizeEmail(req.email());
        if (users.existsByEmail(email)) {
            throw emailTaken();
        }
        try {
            // saveAndFlush surfaces the unique-index violation here if a concurrent
            // request registered the same e-mail between the check and the insert.
            User created = new User(req.fullName(), email, passwordEncoder.encode(req.password()), Role.APPLICANT);
            created.recordFirstLogin(Instant.now());
            User user = users.saveAndFlush(created);
            return toAuthResponse(user);
        } catch (DataIntegrityViolationException e) {
            throw emailTaken();
        }
    }

    /** Not read-only: a successful sign-in updates the user's activity (lastSeenAt, loginCount). */
    @Transactional
    public AuthResponse login(LoginRequest req) {
        User user = users.findByEmail(User.normalizeEmail(req.email())).orElse(null);
        // Always run BCrypt (against a dummy hash for unknown e-mails) and return the same
        // error, so neither the response body nor its timing reveals whether an account exists.
        String hash = user != null ? user.getPasswordHash() : dummyHash;
        boolean matches = passwordEncoder.matches(req.password(), hash);
        if (user == null || !matches) {
            throw new ApiException(ErrorCode.INVALID_CREDENTIALS, "Invalid e-mail or password");
        }
        users.recordLogin(user.getId(), Instant.now());
        User fresh = users.findById(user.getId()).orElseThrow();
        return toAuthResponse(fresh);
    }

    /** Current user (activity is stamped for every authenticated request by ActivityTrackingFilter). */
    @Transactional(readOnly = true)
    public UserResponse me(Long userId) {
        return users.findById(userId).map(UserResponse::from)
                .orElseThrow(() -> new NotFoundException("User", userId));
    }

    private AuthResponse toAuthResponse(User user) {
        JwtService.IssuedToken token = jwtService.issue(user);
        return new AuthResponse(token.value(), token.expiresAt(), UserResponse.from(user));
    }

    private static ApiException emailTaken() {
        return new ApiException(ErrorCode.EMAIL_TAKEN, "E-mail is already registered");
    }
}

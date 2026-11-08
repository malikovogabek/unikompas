package uz.unikompas.auth;

import java.util.Locale;

import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = normalize(req.email());
        if (users.existsByEmail(email)) {
            throw new ApiException(ErrorCode.EMAIL_TAKEN, "E-mail is already registered");
        }
        User user = users.save(new User(req.fullName(), email,
                passwordEncoder.encode(req.password()), Role.APPLICANT));
        return toAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        User user = users.findByEmail(normalize(req.email()))
                .filter(u -> passwordEncoder.matches(req.password(), u.getPasswordHash()))
                // Same error for unknown e-mail and wrong password: no account enumeration.
                .orElseThrow(() -> new ApiException(ErrorCode.INVALID_CREDENTIALS, "Invalid e-mail or password"));
        return toAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse me(Long userId) {
        return users.findById(userId).map(UserResponse::from)
                .orElseThrow(() -> new NotFoundException("User", userId));
    }

    private AuthResponse toAuthResponse(User user) {
        JwtService.IssuedToken token = jwtService.issue(user);
        return new AuthResponse(token.value(), token.expiresAt(), UserResponse.from(user));
    }

    private static String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}

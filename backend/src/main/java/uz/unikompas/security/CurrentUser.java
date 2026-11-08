package uz.unikompas.security;

import org.springframework.security.oauth2.jwt.Jwt;
import uz.unikompas.user.Role;

/**
 * Lightweight view of the authenticated caller, built from JWT claims
 * without a database round-trip. Use in controllers via
 * {@code CurrentUser.from(jwt)} with {@code @AuthenticationPrincipal Jwt jwt}.
 */
public record CurrentUser(Long id, String email, Role role) {

    public static CurrentUser from(Jwt jwt) {
        return new CurrentUser(
                Long.valueOf(jwt.getSubject()),
                jwt.getClaimAsString("email"),
                Role.valueOf(jwt.getClaimAsString(JwtService.ROLE_CLAIM)));
    }
}

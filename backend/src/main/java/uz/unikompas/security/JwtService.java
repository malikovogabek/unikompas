package uz.unikompas.security;

import java.time.Instant;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import uz.unikompas.common.config.UniKompasProperties;
import uz.unikompas.user.User;

/**
 * Issues signed HS256 access tokens. Claims: {@code sub} = user id,
 * {@code email}, {@code name}, {@code role}. Validation is done by the
 * resource-server {@code JwtDecoder} configured in {@link SecurityConfig}.
 */
@Service
@RequiredArgsConstructor
public class JwtService {

    static final String ISSUER = "unikompas";
    static final String ROLE_CLAIM = "role";

    private final JwtEncoder encoder;
    private final UniKompasProperties props;

    public IssuedToken issue(User user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(props.jwt().ttl());
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ISSUER)
                .subject(String.valueOf(user.getId()))
                .issuedAt(now)
                .expiresAt(expiresAt)
                .claim("email", user.getEmail())
                .claim("name", user.getFullName())
                .claim(ROLE_CLAIM, user.getRole().name())
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
        return new IssuedToken(token, expiresAt);
    }

    public record IssuedToken(String value, Instant expiresAt) {
    }
}

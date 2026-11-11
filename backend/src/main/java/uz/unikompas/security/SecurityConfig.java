package uz.unikompas.security;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.util.StringUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.HandlerExceptionResolver;
import uz.unikompas.common.config.UniKompasProperties;

/**
 * Stateless security: JWT bearer tokens (HS256) validated by Spring Security's
 * OAuth2 resource server. Public endpoints are listed explicitly; everything
 * else requires authentication, and role checks use {@code @PreAuthorize}.
 *
 * <p>Rule: the catalog prefixes ({@code /universities}, {@code /directions}, {@code /programs})
 * are <b>entirely public for GET</b>. Personalised reads must live under their own
 * prefixes ({@code /profile}, {@code /recommendations}, {@code /favorites}, {@code /admin}).
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    /** Endpoints reachable without a token (guests can browse the catalog, FR-5, FR-3.2). */
    private static final String[] PUBLIC_POST = {
            "/api/v1/auth/register", "/api/v1/auth/login", "/api/v1/score/calculate"};
    private static final String[] PUBLIC_GET = {
            "/api/v1/health", "/api/v1/regions", "/api/v1/subjects", "/api/v1/fields",
            "/api/v1/universities/**", "/api/v1/directions/**", "/api/v1/programs/**"};
    private static final String[] PUBLIC_ANY = {"/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**", "/error"};

    /** Single source of truth for public requests: used for authorization and token resolution. */
    static final RequestMatcher PUBLIC_REQUESTS = publicRequests();

    private static RequestMatcher publicRequests() {
        var paths = PathPatternRequestMatcher.withDefaults();
        List<RequestMatcher> matchers = new ArrayList<>();
        matchers.add(paths.matcher(HttpMethod.OPTIONS, "/**"));
        Arrays.stream(PUBLIC_POST).forEach(p -> matchers.add(paths.matcher(HttpMethod.POST, p)));
        Arrays.stream(PUBLIC_GET).forEach(p -> matchers.add(paths.matcher(HttpMethod.GET, p)));
        Arrays.stream(PUBLIC_ANY).forEach(p -> matchers.add(paths.matcher(p)));
        return new OrRequestMatcher(matchers);
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http,
                                            JwtAuthenticationConverter jwtAuthConverter,
                                            ActivityTracker activityTracker,
                                            @Qualifier("handlerExceptionResolver") HandlerExceptionResolver resolver)
            throws Exception {
        // Delegate security errors to GlobalExceptionHandler -> uniform ApiError JSON.
        AuthenticationEntryPoint entryPoint = (req, res, ex) -> resolver.resolveException(req, res, null, ex);
        AccessDeniedHandler deniedHandler = (req, res, ex) -> resolver.resolveException(req, res, null, ex);

        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(c -> {})
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_REQUESTS).permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(o -> o
                        .bearerTokenResolver(publicAwareTokenResolver())
                        .jwt(j -> j.jwtAuthenticationConverter(jwtAuthConverter))
                        .authenticationEntryPoint(entryPoint)
                        .accessDeniedHandler(deniedHandler))
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(entryPoint)
                        .accessDeniedHandler(deniedHandler))
                .addFilterAfter(new ActivityTrackingFilter(activityTracker), BearerTokenAuthenticationFilter.class)
                .build();
    }

    /**
     * Ignores the Authorization header on public requests, so a stale or expired token
     * stored by the client never blocks guest-accessible pages with a 401.
     */
    private static BearerTokenResolver publicAwareTokenResolver() {
        DefaultBearerTokenResolver delegate = new DefaultBearerTokenResolver();
        return request -> PUBLIC_REQUESTS.matches(request) ? null : delegate.resolve(request);
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    SecretKey jwtSecretKey(UniKompasProperties props) {
        String secret = props.jwt().secret();
        if (!StringUtils.hasText(secret)) {
            throw new IllegalStateException("unikompas.jwt.secret (JWT_SECRET) must be set");
        }
        byte[] bytes = Base64.getDecoder().decode(secret);
        if (bytes.length < 32) {
            throw new IllegalStateException("unikompas.jwt.secret must be at least 256 bits");
        }
        return new SecretKeySpec(bytes, "HmacSHA256");
    }

    @Bean
    JwtEncoder jwtEncoder(SecretKey key) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(key));
    }

    @Bean
    JwtDecoder jwtDecoder(SecretKey key) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(JwtService.ISSUER));
        return decoder;
    }

    /** Maps the {@code role} claim to a {@code ROLE_*} authority for {@code hasRole(...)} checks. */
    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authorities = new JwtGrantedAuthoritiesConverter();
        authorities.setAuthoritiesClaimName(JwtService.ROLE_CLAIM);
        authorities.setAuthorityPrefix("ROLE_");
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authorities);
        return converter;
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(UniKompasProperties props) {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(props.cors().allowedOrigins());
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept-Language"));
        cfg.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", cfg);
        return source;
    }
}

package uz.unikompas.security;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * After authentication, stamps the caller's activity so the admin panel's "last seen" reflects
 * real usage of an open tab, not only page loads. Never fails the request.
 */
@Slf4j
@RequiredArgsConstructor
public class ActivityTrackingFilter extends OncePerRequestFilter {

    private final ActivityTracker tracker;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwt && auth.isAuthenticated()) {
            try {
                tracker.touch(Long.valueOf(jwt.getToken().getSubject()));
            } catch (RuntimeException e) {
                log.warn("Could not record activity: {}", e.getMessage());
            }
        }
        chain.doFilter(request, response);
    }
}

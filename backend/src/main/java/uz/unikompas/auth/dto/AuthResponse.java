package uz.unikompas.auth.dto;

import java.time.Instant;

/**
 * Successful authentication result: bearer token, its expiry and the user.
 */
public record AuthResponse(String accessToken, String tokenType, Instant expiresAt, UserResponse user) {

    public AuthResponse(String accessToken, Instant expiresAt, UserResponse user) {
        this(accessToken, "Bearer", expiresAt, user);
    }
}

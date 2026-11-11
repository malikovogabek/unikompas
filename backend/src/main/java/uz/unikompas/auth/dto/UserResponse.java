package uz.unikompas.auth.dto;

import java.time.Instant;

import uz.unikompas.user.Role;
import uz.unikompas.user.User;

/**
 * @param lastSeenAt last activity (sign-in or session restore), {@code null} if never recorded
 * @param loginCount number of explicit sign-ins (login + registration)
 */
public record UserResponse(Long id, String fullName, String email, Role role, Instant createdAt,
                           Instant lastSeenAt, int loginCount) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole(), user.getCreatedAt(),
                user.getLastSeenAt(), user.getLoginCount());
    }
}

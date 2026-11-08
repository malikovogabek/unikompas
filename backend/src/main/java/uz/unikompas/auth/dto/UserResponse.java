package uz.unikompas.auth.dto;

import java.time.Instant;

import uz.unikompas.user.Role;
import uz.unikompas.user.User;

public record UserResponse(Long id, String fullName, String email, Role role, Instant createdAt) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole(), user.getCreatedAt());
    }
}

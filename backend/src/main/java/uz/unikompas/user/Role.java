package uz.unikompas.user;

/**
 * System roles (TZ §4.2). Exposed to Spring Security as {@code ROLE_<name>}.
 */
public enum Role {
    APPLICANT,
    ADMIN
}

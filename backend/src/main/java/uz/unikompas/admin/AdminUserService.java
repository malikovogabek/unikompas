package uz.unikompas.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import uz.unikompas.auth.dto.UserResponse;
import uz.unikompas.common.dto.PageResponse;
import uz.unikompas.common.dto.Pageables;
import uz.unikompas.common.persistence.Specs;
import uz.unikompas.user.Role;
import uz.unikompas.user.User;
import uz.unikompas.user.UserRepository;

/** Read-only user list for administrators (FR-8.8). */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminUserService {

    private final UserRepository users;

    public PageResponse<UserResponse> search(String search, Role role, Pageable pageable) {
        Specification<User> text = !StringUtils.hasText(search) ? Specification.unrestricted()
                : (root, q, cb) -> cb.or(
                        Specs.containsIgnoreCase(cb, root.get("email"), search),
                        Specs.containsIgnoreCase(cb, root.get("fullName"), search));
        Specification<User> byRole = role == null ? Specification.unrestricted()
                : (root, q, cb) -> cb.equal(root.get("role"), role);
        return PageResponse.from(users.findAll(Specification.allOf(text, byRole), Pageables.withIdTiebreaker(pageable))
                .map(UserResponse::from));
    }
}

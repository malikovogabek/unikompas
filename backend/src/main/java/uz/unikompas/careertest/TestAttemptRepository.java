package uz.unikompas.careertest;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestAttemptRepository extends JpaRepository<TestAttempt, Long> {

    Optional<TestAttempt> findFirstByUserIdOrderByCreatedAtDescIdDesc(Long userId);

    Page<TestAttempt> findByUserIdOrderByCreatedAtDescIdDesc(Long userId, Pageable pageable);
}

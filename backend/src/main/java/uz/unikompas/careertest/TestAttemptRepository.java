package uz.unikompas.careertest;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TestAttemptRepository extends JpaRepository<TestAttempt, Long> {

    Optional<TestAttempt> findFirstByUserIdOrderByCreatedAtDescIdDesc(Long userId);

    List<TestAttempt> findTop20ByUserIdOrderByCreatedAtDescIdDesc(Long userId);
}

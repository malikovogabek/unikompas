package uz.unikompas.direction;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface DirectionRepository extends JpaRepository<Direction, Long>, JpaSpecificationExecutor<Direction> {

    @Override
    @EntityGraph(attributePaths = {"field", "firstSubject", "secondSubject"})
    Page<Direction> findAll(Specification<Direction> spec, Pageable pageable);

    @EntityGraph(attributePaths = {"field", "firstSubject", "secondSubject"})
    Optional<Direction> findDetailedById(Long id);

    Optional<Direction> findByCode(String code);
}

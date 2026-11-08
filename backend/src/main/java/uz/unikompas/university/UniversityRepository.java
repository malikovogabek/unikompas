package uz.unikompas.university;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface UniversityRepository extends JpaRepository<University, Long>, JpaSpecificationExecutor<University> {

    @Override
    @EntityGraph(attributePaths = "region")
    Page<University> findAll(Specification<University> spec, Pageable pageable);

    @EntityGraph(attributePaths = "region")
    Optional<University> findWithRegionById(Long id);
}

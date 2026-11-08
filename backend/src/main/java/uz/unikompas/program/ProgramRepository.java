package uz.unikompas.program;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

/**
 * Program queries always fetch university, region and direction in one SQL
 * statement to avoid N+1 selects in catalog lists.
 */
public interface ProgramRepository extends JpaRepository<Program, Long> {

    String FETCH = """
            select p from Program p
              join fetch p.university u
              join fetch u.region
              join fetch p.direction d
              join fetch d.field
              join fetch d.firstSubject
              join fetch d.secondSubject
            """;

    @Query(FETCH + " where u.id = :universityId order by d.name, p.language, p.studyForm")
    List<Program> findByUniversity(Long universityId);

    @Query(FETCH + " where d.id = :directionId order by u.rating desc, u.name, p.language")
    List<Program> findByDirection(Long directionId);

    @Query(FETCH + " where p.id in :ids")
    List<Program> findDetailedByIds(Collection<Long> ids);

    @Query(FETCH + " where p.id = :id")
    Optional<Program> findDetailedById(Long id);

    long countByUniversityId(Long universityId);

    long countByDirectionId(Long directionId);

    /** Used by the recommendation engine: the whole catalog in one query. */
    @Query(FETCH)
    List<Program> findAllDetailed();
}

package uz.unikompas.program;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PassingScoreRepository extends JpaRepository<PassingScore, Long> {

    /** Score history for many programs at once, oldest year first. */
    @Query("select s from PassingScore s where s.program.id in :programIds order by s.program.id, s.year")
    List<PassingScore> findByProgramIds(Collection<Long> programIds);
}

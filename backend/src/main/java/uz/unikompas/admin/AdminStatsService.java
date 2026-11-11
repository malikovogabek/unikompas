package uz.unikompas.admin;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.unikompas.admin.dto.StatsResponse;
import uz.unikompas.admin.dto.StatsResponse.Ranked;
import uz.unikompas.profile.ApplicantProfile;

/**
 * Aggregates for the admin dashboard (FR-8.7). "Most recommended" counts how often a
 * direction or university appears in the top 10 of generated recommendations.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminStatsService {

    static final int TOP_RANK = 10;
    static final int TOP_N = 5;

    private final EntityManager em;

    public StatsResponse stats() {
        long[] activity = applicantActivity();
        return new StatsResponse(
                activity[0], activity[1], activity[2],
                count("select count(p) from ApplicantProfile p where " + ApplicantProfile.COMPLETE_JPQL),
                count("select count(t) from TestAttempt t"),
                count("select count(distinct t.userId) from TestAttempt t"),
                count("select count(r) from Recommendation r"),
                new StatsResponse.Catalog(
                        count("select count(u) from University u"),
                        count("select count(d) from Direction d"),
                        count("select count(p) from Program p")),
                ranked("""
                        select d.id, d.code, d.name, count(i) from RecommendationItem i, Program p join p.direction d
                         where p.id = i.programId and i.rank <= :top
                         group by d.id, d.code, d.name order by count(i) desc, d.id""", true),
                ranked("""
                        select u.id, u.shortName, u.name, count(i) from RecommendationItem i, Program p
                          join p.university u
                         where p.id = i.programId and i.rank <= :top
                         group by u.id, u.shortName, u.name order by count(i) desc, u.id""", true),
                ranked("""
                        select r.id, r.code, r.name, count(p) from ApplicantProfile p join p.region r
                         group by r.id, r.code, r.name order by count(p) desc, r.id""", false));
    }

    /** [applicants, active in 24 h, active in 7 days] in one query over one consistent "now". */
    private long[] applicantActivity() {
        Instant now = Instant.now();
        Object[] row = em.createQuery("""
                        select count(u),
                               coalesce(sum(case when u.lastSeenAt >= :day then 1 else 0 end), 0),
                               coalesce(sum(case when u.lastSeenAt >= :week then 1 else 0 end), 0)
                          from User u where u.role = uz.unikompas.user.Role.APPLICANT""", Object[].class)
                .setParameter("day", now.minus(Duration.ofHours(24)))
                .setParameter("week", now.minus(Duration.ofDays(7)))
                .getSingleResult();
        return new long[] {((Number) row[0]).longValue(), ((Number) row[1]).longValue(), ((Number) row[2]).longValue()};
    }

    private long count(String jpql) {
        return em.createQuery(jpql, Long.class).getSingleResult();
    }

    private List<Ranked> ranked(String jpql, boolean topParam) {
        var q = em.createQuery(jpql, Object[].class);
        if (topParam) {
            q.setParameter("top", TOP_RANK);
            q.setMaxResults(TOP_N);
        }
        return q.getResultList().stream()
                .map(r -> new Ranked((Long) r[0], (String) r[1], (String) r[2], (Long) r[3]))
                .toList();
    }
}

package uz.unikompas.program.dto;

import java.util.List;

import uz.unikompas.direction.dto.DirectionResponse;
import uz.unikompas.program.Program;
import uz.unikompas.program.StudyForm;
import uz.unikompas.program.StudyLanguage;
import uz.unikompas.university.dto.UniversityResponse;

/**
 * Admission offer with its score history (oldest → newest). The history is
 * always included because it is small (≤ 3–5 years) and the UI shows a trend
 * sparkline on every card.
 */
public record ProgramResponse(
        Long id, UniversityResponse university, DirectionResponse direction,
        StudyLanguage language, StudyForm studyForm, int grantQuota, int contractQuota,
        long contractFee, int durationYears, ScoreHistoryItem latestScores, List<ScoreHistoryItem> scoreHistory) {

    public static ProgramResponse from(Program p, List<ScoreHistoryItem> history) {
        ScoreHistoryItem latest = history.isEmpty() ? null : history.getLast();
        return new ProgramResponse(p.getId(), UniversityResponse.from(p.getUniversity()),
                DirectionResponse.from(p.getDirection()), p.getLanguage(), p.getStudyForm(),
                p.getGrantQuota(), p.getContractQuota(), p.getContractFee(), p.getDurationYears(),
                latest, history);
    }
}

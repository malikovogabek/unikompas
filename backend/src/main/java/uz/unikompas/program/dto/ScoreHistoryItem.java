package uz.unikompas.program.dto;

import java.math.BigDecimal;

import uz.unikompas.program.PassingScore;

/** Passing scores of one year; a {@code null} score means no places of that type. */
public record ScoreHistoryItem(int year, BigDecimal grantScore, BigDecimal contractScore) {

    public static ScoreHistoryItem from(PassingScore s) {
        return new ScoreHistoryItem(s.getYear(), s.getGrantScore(), s.getContractScore());
    }
}

package uz.unikompas.recommendation;

import java.util.List;

/**
 * Engine output for one program: the four criteria (0..1), weighted total,
 * chance band, per-financing probabilities ({@code null} = not an option),
 * forecasts and explanations.
 */
public record ScoredProgram(
        ProgramCandidate candidate, double interest, double chance, double preference, double rating,
        double total, Category category, Double grantChance, Double contractChance,
        Double predictedGrantScore, Double predictedContractScore, List<Reason> reasons) {
}

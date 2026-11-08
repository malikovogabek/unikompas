package uz.unikompas.careertest;

import java.util.Comparator;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * Holland RIASEC helpers. Vectors are always in R, I, A, S, E, C order.
 */
public final class Riasec {

    public static final String TYPES = "RIASEC";

    private Riasec() {
    }

    /**
     * Three-letter Holland code: the three highest dimensions, ties broken by RIASEC order.
     * E.g. {@code [5, 9, 3, 2, 3, 6]} → {@code "ICR"}.
     */
    public static String hollandCode(double[] vector) {
        if (vector.length != 6) {
            throw new IllegalArgumentException("RIASEC vector must have 6 components");
        }
        return IntStream.range(0, 6).boxed()
                .sorted(Comparator.comparingDouble((Integer i) -> vector[i]).reversed()
                        .thenComparingInt(i -> i))
                .limit(3)
                .map(i -> String.valueOf(TYPES.charAt(i)))
                .collect(Collectors.joining());
    }
}

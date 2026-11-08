package uz.unikompas.recommendation;

/**
 * Admission-chance band of a recommended program (TZ §6.5).
 */
public enum Category {
    /** C ≥ 0.75 — "Ishonchli". */
    SAFE(0.75),
    /** 0.40 ≤ C < 0.75 — "Maqbul". */
    TARGET(0.40),
    /** 0.15 ≤ C < 0.40 — "Orzu". */
    REACH(0.15);

    private final double minChance;

    Category(double minChance) {
        this.minChance = minChance;
    }

    /** @return the band for a chance, or {@code null} when below every band (not recommended) */
    public static Category of(double chance) {
        for (Category c : values()) {
            if (chance >= c.minChance) {
                return c;
            }
        }
        return null;
    }
}

package uz.unikompas.recommendation;

import java.util.Map;

/**
 * Machine-readable explanation of a recommendation (TZ §6.6). The client renders
 * {@code reasons.<code>} from its locale file, interpolating {@code params}.
 */
public record Reason(String code, Map<String, Object> params) {

    public static Reason of(String code) {
        return new Reason(code, Map.of());
    }

    public static Reason of(String code, Map<String, Object> params) {
        return new Reason(code, Map.copyOf(params));
    }
}

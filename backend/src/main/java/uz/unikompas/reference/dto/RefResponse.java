package uz.unikompas.reference.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import uz.unikompas.reference.Field;
import uz.unikompas.reference.Region;
import uz.unikompas.reference.Subject;

/**
 * Compact reference item. {@code name} is the Uzbek fallback; clients translate by {@code code}.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record RefResponse(Long id, String code, String name, String icon) {

    public static RefResponse of(Region r) {
        return new RefResponse(r.getId(), r.getCode(), r.getName(), null);
    }

    public static RefResponse of(Subject s) {
        return new RefResponse(s.getId(), s.getCode(), s.getName(), null);
    }

    public static RefResponse of(Field f) {
        return new RefResponse(f.getId(), f.getCode(), f.getName(), f.getIcon());
    }
}

package uz.unikompas.common.exception;

import java.time.Instant;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Uniform error body for every failed request (TZ §8).
 *
 * @param error       stable {@link ErrorCode} name, translated on the client
 * @param message     short technical description in English (not shown to end users)
 * @param fieldErrors field name → violated constraint (e.g. {@code NotBlank}); only for validation errors
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> fieldErrors) {

    public static ApiError of(ErrorCode code, String message, String path) {
        return new ApiError(Instant.now(), code.status().value(), code.name(), message, path, null);
    }

    public static ApiError validation(String path, Map<String, String> fieldErrors) {
        return new ApiError(Instant.now(), ErrorCode.VALIDATION_ERROR.status().value(),
                ErrorCode.VALIDATION_ERROR.name(), "Request validation failed", path, fieldErrors);
    }
}

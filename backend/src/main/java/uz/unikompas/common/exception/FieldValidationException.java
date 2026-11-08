package uz.unikompas.common.exception;

import java.util.Map;

/**
 * Business-rule validation failure tied to specific request fields
 * (e.g. an unknown region id). Rendered like Bean Validation errors:
 * 400 VALIDATION_ERROR with {@code fieldErrors: {field: code}}.
 */
public class FieldValidationException extends ApiException {

    private final Map<String, String> fieldErrors;

    public FieldValidationException(Map<String, String> fieldErrors) {
        super(ErrorCode.VALIDATION_ERROR, "Request validation failed");
        this.fieldErrors = Map.copyOf(fieldErrors);
    }

    public static FieldValidationException of(String field, String code) {
        return new FieldValidationException(Map.of(field, code));
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }
}

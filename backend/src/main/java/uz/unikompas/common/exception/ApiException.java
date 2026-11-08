package uz.unikompas.common.exception;

/**
 * Business exception carrying an {@link ErrorCode}; mapped to an {@link ApiError}
 * by {@link GlobalExceptionHandler}. Throw this (or a subclass) from services
 * instead of building HTTP responses manually.
 */
public class ApiException extends RuntimeException {

    private final ErrorCode code;

    public ApiException(ErrorCode code, String message) {
        super(message);
        this.code = code;
    }

    public ErrorCode getCode() {
        return code;
    }
}

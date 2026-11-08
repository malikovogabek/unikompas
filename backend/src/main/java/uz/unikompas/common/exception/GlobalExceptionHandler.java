package uz.unikompas.common.exception;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSourceResolvable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.core.PropertyReferenceException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.validation.method.ParameterErrors;
import org.springframework.validation.method.ParameterValidationResult;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

/**
 * Translates every exception into the uniform {@link ApiError} format.
 * Security filter errors are routed here too (see {@code SecurityConfig}),
 * so clients always receive the same JSON shape. Client mistakes are mapped
 * to 4xx and never logged as server errors.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(FieldValidationException.class)
    ResponseEntity<ApiError> handleFieldValidation(FieldValidationException ex, HttpServletRequest req) {
        return ResponseEntity.badRequest().body(ApiError.validation(req.getRequestURI(), ex.getFieldErrors()));
    }

    @ExceptionHandler(ApiException.class)
    ResponseEntity<ApiError> handleApi(ApiException ex, HttpServletRequest req) {
        return build(ex.getCode(), ex.getMessage(), req);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> fields = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            // Constraint name (NotBlank, Email, Size...) is translated on the client: validation.<code>
            fields.putIfAbsent(fe.getField(), fe.getCode());
        }
        return ResponseEntity.badRequest().body(ApiError.validation(req.getRequestURI(), fields));
    }

    /**
     * Method-level validation (e.g. {@code List<@Valid PassingScoreRequest>} bodies). Keys look like
     * {@code scores[0].grantScore} or {@code scores[1]}; values are constraint names.
     */
    @ExceptionHandler(HandlerMethodValidationException.class)
    ResponseEntity<ApiError> handleMethodValidation(HandlerMethodValidationException ex, HttpServletRequest req) {
        Map<String, String> fields = new LinkedHashMap<>();
        for (ParameterValidationResult result : ex.getParameterValidationResults()) {
            String name = result.getMethodParameter().getParameterName();
            String prefix = result.getContainerIndex() == null ? name : name + "[" + result.getContainerIndex() + "]";
            if (result instanceof ParameterErrors errors) {
                errors.getFieldErrors().forEach(fe -> fields.putIfAbsent(prefix + "." + fe.getField(), fe.getCode()));
            } else {
                result.getResolvableErrors().forEach(e -> fields.putIfAbsent(prefix, constraintName(e)));
            }
        }
        return ResponseEntity.badRequest().body(ApiError.validation(req.getRequestURI(), fields));
    }

    /** Last (least specific) message code is the bare constraint name, e.g. {@code NotNull}. */
    private static String constraintName(MessageSourceResolvable error) {
        String[] codes = error.getCodes();
        return codes == null || codes.length == 0 ? "Invalid" : codes[codes.length - 1];
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class,
            PropertyReferenceException.class})
    ResponseEntity<ApiError> handleMalformed(Exception ex, HttpServletRequest req) {
        return build(ErrorCode.MALFORMED_REQUEST, "Malformed request", req);
    }

    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<ApiError> handleAuthentication(AuthenticationException ex, HttpServletRequest req) {
        return build(ErrorCode.UNAUTHORIZED, "Authentication required", req);
    }

    @ExceptionHandler({AccessDeniedException.class, AuthorizationDeniedException.class})
    ResponseEntity<ApiError> handleAccessDenied(Exception ex, HttpServletRequest req) {
        return build(ErrorCode.FORBIDDEN, "Access denied", req);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ResponseEntity<ApiError> handleTooLarge(MaxUploadSizeExceededException ex, HttpServletRequest req) {
        return build(ErrorCode.PAYLOAD_TOO_LARGE, "Uploaded file is too large", req);
    }

    /** Unique/foreign-key violations that slipped past service checks (e.g. concurrent inserts). */
    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ApiError> handleDataIntegrity(DataIntegrityViolationException ex, HttpServletRequest req) {
        log.warn("Data integrity violation on {} {}: {}", req.getMethod(), req.getRequestURI(),
                ex.getMostSpecificCause().getMessage());
        return build(ErrorCode.CONFLICT, "Request conflicts with existing data", req);
    }

    /**
     * Fallback. Spring MVC client errors (404 no route, 405, 406, 415, missing
     * parameter/header...) implement {@link ErrorResponse} and keep their own 4xx status;
     * anything else is a genuine server error.
     */
    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiError> handleUnexpected(Exception ex, HttpServletRequest req) {
        if (ex instanceof ErrorResponse er && er.getStatusCode().is4xxClientError()) {
            int status = er.getStatusCode().value();
            ApiError body = new ApiError(Instant.now(), status, ErrorCode.fromStatus(status).name(),
                    er.getBody().getDetail(), req.getRequestURI(), null);
            return ResponseEntity.status(status).body(body);
        }
        log.error("Unhandled error on {} {}", req.getMethod(), req.getRequestURI(), ex);
        return build(ErrorCode.INTERNAL_ERROR, "Unexpected server error", req);
    }

    private static ResponseEntity<ApiError> build(ErrorCode code, String message, HttpServletRequest req) {
        return ResponseEntity.status(code.status()).body(ApiError.of(code, message, req.getRequestURI()));
    }
}

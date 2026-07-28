package com.nhutruong.blood.shared.exception;

import com.nhutruong.blood.shared.api.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Instant;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    private final Environment environment;

    public GlobalExceptionHandler(Environment environment) {
        this.environment = environment;
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleBusinessException(
            BusinessException exception,
            HttpServletRequest request
    ) {
        ErrorCode code = exception.errorCode();
        return ResponseEntity
                .status(code.status())
                .body(ApiResponse.failure(exception.getMessage(), errorBody(code, request.getRequestURI())));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleValidationException(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {
        Map<String, String> fields = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors()
                .forEach(error -> fields.put(error.getField(), error.getDefaultMessage()));

        Map<String, Object> body = errorBody(ErrorCode.VALIDATION_ERROR, request.getRequestURI());
        body.put("fields", fields);

        return ResponseEntity
                .badRequest()
                .body(ApiResponse.failure(ErrorCode.VALIDATION_ERROR.defaultMessage(), body));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleUnreadableBody(
            HttpMessageNotReadableException exception,
            HttpServletRequest request
    ) {
        ErrorCode code = ErrorCode.VALIDATION_ERROR;
        log.warn("Malformed request body at {}: {}", request.getRequestURI(), exception.getMessage());
        return ResponseEntity
                .status(code.status())
                .body(ApiResponse.failure("Malformed JSON request body", errorBody(code, request.getRequestURI())));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleMissingParam(
            MissingServletRequestParameterException exception,
            HttpServletRequest request
    ) {
        ErrorCode code = ErrorCode.VALIDATION_ERROR;
        return ResponseEntity
                .status(code.status())
                .body(ApiResponse.failure(
                        "Missing required parameter: " + exception.getParameterName(),
                        errorBody(code, request.getRequestURI())));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleTypeMismatch(
            MethodArgumentTypeMismatchException exception,
            HttpServletRequest request
    ) {
        ErrorCode code = ErrorCode.VALIDATION_ERROR;
        return ResponseEntity
                .status(code.status())
                .body(ApiResponse.failure(
                        "Invalid value for parameter: " + exception.getName(),
                        errorBody(code, request.getRequestURI())));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException exception,
            HttpServletRequest request
    ) {
        return ResponseEntity
                .status(ErrorCode.METHOD_NOT_ALLOWED.status())
                .body(ApiResponse.failure(
                        "HTTP method " + exception.getMethod() + " not supported on this endpoint",
                        errorBody(ErrorCode.METHOD_NOT_ALLOWED, request.getRequestURI())));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleDataIntegrity(
            DataIntegrityViolationException exception,
            HttpServletRequest request
    ) {
        log.warn("Data integrity violation at {}: {}", request.getRequestURI(), exception.getMostSpecificCause().getMessage());
        return ResponseEntity
                .status(ErrorCode.CONFLICT.status())
                .body(ApiResponse.failure("Data integrity violation", errorBody(ErrorCode.CONFLICT, request.getRequestURI())));
    }

    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleOptimisticLock(
            OptimisticLockingFailureException exception,
            HttpServletRequest request
    ) {
        log.warn("Optimistic lock failure at {}: {}", request.getRequestURI(), exception.getMessage());
        return ResponseEntity
                .status(ErrorCode.CONFLICT.status())
                .body(ApiResponse.failure(
                        "Record was modified concurrently. Please retry.",
                        errorBody(ErrorCode.CONFLICT, request.getRequestURI())));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleAuthenticationException(
            AuthenticationException exception,
            HttpServletRequest request
    ) {
        return ResponseEntity
                .status(ErrorCode.UNAUTHENTICATED.status())
                .body(ApiResponse.failure("Invalid email or password", errorBody(ErrorCode.UNAUTHENTICATED, request.getRequestURI())));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleBadCredentialsException(
            BadCredentialsException exception,
            HttpServletRequest request
    ) {
        return ResponseEntity
                .status(ErrorCode.UNAUTHENTICATED.status())
                .body(ApiResponse.failure("Invalid email or password", errorBody(ErrorCode.UNAUTHENTICATED, request.getRequestURI())));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleAccessDeniedException(
            AccessDeniedException exception,
            HttpServletRequest request
    ) {
        return ResponseEntity
                .status(ErrorCode.FORBIDDEN.status())
                .body(ApiResponse.failure(ErrorCode.FORBIDDEN.defaultMessage(), errorBody(ErrorCode.FORBIDDEN, request.getRequestURI())));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleUnexpectedException(
            Exception exception,
            HttpServletRequest request
    ) {
        Map<String, Object> body = errorBody(ErrorCode.INTERNAL_ERROR, request.getRequestURI());
        // Leak exception type only outside production profiles.
        boolean isProd = Arrays.stream(environment.getActiveProfiles())
                .anyMatch(p -> p.equalsIgnoreCase("prod") || p.equalsIgnoreCase("production"));
        if (!isProd) {
            body.put("type", exception.getClass().getSimpleName());
        }
        log.error("Unexpected error at {}: {}", request.getRequestURI(), exception.getMessage(), exception);
        return ResponseEntity
                .status(ErrorCode.INTERNAL_ERROR.status())
                .body(ApiResponse.failure(ErrorCode.INTERNAL_ERROR.defaultMessage(), body));
    }

    private Map<String, Object> errorBody(ErrorCode code, String path) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("code", code.name());
        body.put("path", path);
        body.put("timestamp", Instant.now().toString());
        return body;
    }
}

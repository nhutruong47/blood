package com.nhutruong.blood.shared.exception;

import com.nhutruong.blood.shared.api.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

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
        if (!activeProfile.contains("prod")) {
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

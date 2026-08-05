package com.nhutruong.blood.shared.exception;

import com.nhutruong.blood.shared.api.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Path;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @Mock
    private Environment environment;

    @Mock
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler(environment);
        when(request.getRequestURI()).thenReturn("/api/test");
    }

    @Nested
    @DisplayName("handleBusinessException tests")
    class HandleBusinessExceptionTests {

        @Test
        @DisplayName("Should handle BusinessException with VALIDATION_ERROR")
        void shouldHandleBusinessExceptionWithValidationError() {
            BusinessException exception = new BusinessException(ErrorCode.VALIDATION_ERROR, "Invalid input");

            ResponseEntity<ApiResponse<Map<String, Object>>> response =
                    exceptionHandler.handleBusinessException(exception, request);

            assertEquals(400, response.getStatusCode().value());
            assertFalse(response.getBody().success());
            assertEquals("Invalid input", response.getBody().message());
        }

        @Test
        @DisplayName("Should handle BusinessException with NOT_FOUND")
        void shouldHandleBusinessExceptionWithNotFound() {
            BusinessException exception = new BusinessException(ErrorCode.NOT_FOUND, "User not found");

            ResponseEntity<ApiResponse<Map<String, Object>>> response =
                    exceptionHandler.handleBusinessException(exception, request);

            assertEquals(404, response.getStatusCode().value());
            assertEquals("User not found", response.getBody().message());
        }
    }

    @Nested
    @DisplayName("handleConstraintViolation tests")
    class HandleConstraintViolationTests {

        @Test
        @DisplayName("Should handle ConstraintViolationException with field errors")
        @SuppressWarnings("unchecked")
        void shouldHandleConstraintViolationWithFieldErrors() {
            ConstraintViolationException exception = mock(ConstraintViolationException.class);
            ConstraintViolation<?> violation = mock(ConstraintViolation.class);
            Path path = mock(Path.class);

            when(violation.getPropertyPath()).thenReturn(path);
            when(path.toString()).thenReturn("email");
            when(violation.getMessage()).thenReturn("must not be blank");

            Set<ConstraintViolation<?>> violations = new HashSet<>(List.of(violation));
            when(exception.getConstraintViolations()).thenReturn(violations);

            ResponseEntity<ApiResponse<Map<String, Object>>> response =
                    exceptionHandler.handleConstraintViolation(exception, request);

            assertEquals(400, response.getStatusCode().value());
            assertFalse(response.getBody().success());

            @SuppressWarnings("unchecked")
            Map<String, String> fields = (Map<String, String>) response.getBody().data().get("fields");
            assertEquals("must not be blank", fields.get("email"));
        }
    }

    @Nested
    @DisplayName("handleValidationException tests")
    class HandleValidationExceptionTests {

        @Test
        @DisplayName("Should handle MethodArgumentNotValidException")
        @SuppressWarnings("unchecked")
        void shouldHandleMethodArgumentNotValidException() {
            MethodArgumentNotValidException exception = mock(MethodArgumentNotValidException.class);
            org.springframework.validation.BindingResult bindingResult = mock(org.springframework.validation.BindingResult.class);
            org.springframework.validation.FieldError fieldError = mock(org.springframework.validation.FieldError.class);

            when(exception.getBindingResult()).thenReturn(bindingResult);
            when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));
            when(fieldError.getField()).thenReturn("email");
            when(fieldError.getDefaultMessage()).thenReturn("invalid format");

            ResponseEntity<ApiResponse<Map<String, Object>>> response =
                    exceptionHandler.handleValidationException(exception, request);

            assertEquals(400, response.getStatusCode().value());

            @SuppressWarnings("unchecked")
            Map<String, String> fields = (Map<String, String>) response.getBody().data().get("fields");
            assertEquals("invalid format", fields.get("email"));
        }
    }

    @Nested
    @DisplayName("handleUnreadableBody tests")
    class HandleUnreadableBodyTests {

        @Test
        @DisplayName("Should handle HttpMessageNotReadableException")
        void shouldHandleHttpMessageNotReadableException() {
            HttpMessageNotReadableException exception = mock(HttpMessageNotReadableException.class);

            ResponseEntity<ApiResponse<Map<String, Object>>> response =
                    exceptionHandler.handleUnreadableBody(exception, request);

            assertEquals(400, response.getStatusCode().value());
            assertEquals("Malformed JSON request body", response.getBody().message());
        }
    }

    @Nested
    @DisplayName("handleMissingParam tests")
    class HandleMissingParamTests {

        @Test
        @DisplayName("Should handle MissingServletRequestParameterException")
        void shouldHandleMissingServletRequestParameterException() {
            MissingServletRequestParameterException exception =
                    mock(MissingServletRequestParameterException.class);
            when(exception.getParameterName()).thenReturn("id");

            ResponseEntity<ApiResponse<Map<String, Object>>> response =
                    exceptionHandler.handleMissingParam(exception, request);

            assertEquals(400, response.getStatusCode().value());
            assertEquals("Missing required parameter: id", response.getBody().message());
        }
    }

    @Nested
    @DisplayName("handleTypeMismatch tests")
    class HandleTypeMismatchTests {

        @Test
        @DisplayName("Should handle MethodArgumentTypeMismatchException")
        void shouldHandleMethodArgumentTypeMismatchException() {
            MethodArgumentTypeMismatchException exception =
                    mock(MethodArgumentTypeMismatchException.class);
            when(exception.getName()).thenReturn("userId");

            ResponseEntity<ApiResponse<Map<String, Object>>> response =
                    exceptionHandler.handleTypeMismatch(exception, request);

            assertEquals(400, response.getStatusCode().value());
            assertEquals("Invalid value for parameter: userId", response.getBody().message());
        }
    }

    @Nested
    @DisplayName("handleMethodNotSupported tests")
    class HandleMethodNotSupportedTests {

        @Test
        @DisplayName("Should handle HttpRequestMethodNotSupportedException")
        void shouldHandleHttpRequestMethodNotSupportedException() {
            HttpRequestMethodNotSupportedException exception =
                    mock(HttpRequestMethodNotSupportedException.class);
            when(exception.getMethod()).thenReturn("DELETE");

            ResponseEntity<ApiResponse<Map<String, Object>>> response =
                    exceptionHandler.handleMethodNotSupported(exception, request);

            assertEquals(405, response.getStatusCode().value());
            assertTrue(response.getBody().message().contains("DELETE"));
        }
    }

    @Nested
    @DisplayName("handleDataIntegrity tests")
    class HandleDataIntegrityTests {

        @Test
        @DisplayName("Should handle DataIntegrityViolationException")
        void shouldHandleDataIntegrityViolationException() {
            DataIntegrityViolationException exception =
                    mock(DataIntegrityViolationException.class);
            when(exception.getMostSpecificCause()).thenReturn(new RuntimeException("Duplicate key"));

            ResponseEntity<ApiResponse<Map<String, Object>>> response =
                    exceptionHandler.handleDataIntegrity(exception, request);

            assertEquals(409, response.getStatusCode().value());
            assertEquals("Data integrity violation", response.getBody().message());
        }
    }

    @Nested
    @DisplayName("handleOptimisticLock tests")
    class HandleOptimisticLockTests {

        @Test
        @DisplayName("Should handle OptimisticLockingFailureException")
        void shouldHandleOptimisticLockingFailureException() {
            OptimisticLockingFailureException exception =
                    mock(OptimisticLockingFailureException.class);

            ResponseEntity<ApiResponse<Map<String, Object>>> response =
                    exceptionHandler.handleOptimisticLock(exception, request);

            assertEquals(409, response.getStatusCode().value());
            assertEquals("Record was modified concurrently. Please retry.", response.getBody().message());
        }
    }

    @Nested
    @DisplayName("handleAuthenticationException tests")
    class HandleAuthenticationExceptionTests {

        @Test
        @DisplayName("Should handle AuthenticationException")
        void shouldHandleAuthenticationException() {
            AuthenticationException exception = mock(AuthenticationException.class);

            ResponseEntity<ApiResponse<Map<String, Object>>> response =
                    exceptionHandler.handleAuthenticationException(exception, request);

            assertEquals(401, response.getStatusCode().value());
            assertEquals("Invalid email or password", response.getBody().message());
        }
    }

    @Nested
    @DisplayName("handleBadCredentialsException tests")
    class HandleBadCredentialsExceptionTests {

        @Test
        @DisplayName("Should handle BadCredentialsException")
        void shouldHandleBadCredentialsException() {
            BadCredentialsException exception = mock(BadCredentialsException.class);

            ResponseEntity<ApiResponse<Map<String, Object>>> response =
                    exceptionHandler.handleBadCredentialsException(exception, request);

            assertEquals(401, response.getStatusCode().value());
            assertEquals("Invalid email or password", response.getBody().message());
        }
    }

    @Nested
    @DisplayName("handleAccessDeniedException tests")
    class HandleAccessDeniedExceptionTests {

        @Test
        @DisplayName("Should handle AccessDeniedException")
        void shouldHandleAccessDeniedException() {
            AccessDeniedException exception = mock(AccessDeniedException.class);

            ResponseEntity<ApiResponse<Map<String, Object>>> response =
                    exceptionHandler.handleAccessDeniedException(exception, request);

            assertEquals(403, response.getStatusCode().value());
            assertEquals(ErrorCode.FORBIDDEN.defaultMessage(), response.getBody().message());
        }
    }

    @Nested
    @DisplayName("handleUnexpectedException tests")
    class HandleUnexpectedExceptionTests {

        @Test
        @DisplayName("Should hide exception type in production profile")
        void shouldHideExceptionTypeInProductionProfile() {
            RuntimeException exception = new RuntimeException("Something went wrong");

            when(environment.getActiveProfiles()).thenReturn(new String[]{"prod"});

            ResponseEntity<ApiResponse<Map<String, Object>>> response =
                    exceptionHandler.handleUnexpectedException(exception, request);

            assertEquals(500, response.getStatusCode().value());
            assertFalse(response.getBody().success());
            assertNull(response.getBody().data().get("type"));
        }

        @Test
        @DisplayName("Should expose exception type outside production profile")
        void shouldExposeExceptionTypeOutsideProductionProfile() {
            RuntimeException exception = new RuntimeException("Something went wrong");

            when(environment.getActiveProfiles()).thenReturn(new String[]{"dev"});

            ResponseEntity<ApiResponse<Map<String, Object>>> response =
                    exceptionHandler.handleUnexpectedException(exception, request);

            assertEquals(500, response.getStatusCode().value());
            assertEquals("RuntimeException", response.getBody().data().get("type"));
        }

        @Test
        @DisplayName("Should handle exception in default profile")
        void shouldHandleExceptionInDefaultProfile() {
            IllegalStateException exception = new IllegalStateException("Unexpected state");

            when(environment.getActiveProfiles()).thenReturn(new String[]{});

            ResponseEntity<ApiResponse<Map<String, Object>>> response =
                    exceptionHandler.handleUnexpectedException(exception, request);

            assertEquals(500, response.getStatusCode().value());
            assertEquals("IllegalStateException", response.getBody().data().get("type"));
        }
    }

    @Nested
    @DisplayName("Edge case tests")
    class EdgeCaseTests {

        @Test
        @DisplayName("Should handle empty request URI")
        void shouldHandleEmptyRequestUri() {
            when(request.getRequestURI()).thenReturn("");

            BusinessException exception = new BusinessException(ErrorCode.NOT_FOUND, "Not found");

            ResponseEntity<ApiResponse<Map<String, Object>>> response =
                    exceptionHandler.handleBusinessException(exception, request);

            assertEquals(404, response.getStatusCode().value());
            assertEquals("", response.getBody().data().get("path"));
        }

        @Test
        @DisplayName("Should handle long message")
        void shouldHandleLongMessage() {
            String longMessage = "A".repeat(1000);
            BusinessException exception = new BusinessException(ErrorCode.VALIDATION_ERROR, longMessage);

            ResponseEntity<ApiResponse<Map<String, Object>>> response =
                    exceptionHandler.handleBusinessException(exception, request);

            assertEquals(400, response.getStatusCode().value());
            assertEquals(longMessage, response.getBody().message());
        }

        @Test
        @DisplayName("Should include all error codes in error body")
        void shouldIncludeAllErrorCodesInErrorBody() {
            for (ErrorCode code : ErrorCode.values()) {
                BusinessException exception = new BusinessException(code, "Test message");
                ResponseEntity<ApiResponse<Map<String, Object>>> response =
                        exceptionHandler.handleBusinessException(exception, request);

                assertEquals(code.status().value(), response.getStatusCode().value());
                assertEquals(code.name(), response.getBody().data().get("code"));
            }
        }

        @Test
        @DisplayName("Should handle special characters in request URI")
        void shouldHandleSpecialCharactersInRequestUri() {
            when(request.getRequestURI()).thenReturn("/api/users/123/profile?lang=en");

            BusinessException exception = new BusinessException(ErrorCode.NOT_FOUND, "Not found");

            ResponseEntity<ApiResponse<Map<String, Object>>> response =
                    exceptionHandler.handleBusinessException(exception, request);

            assertEquals("/api/users/123/profile?lang=en", response.getBody().data().get("path"));
        }
    }
}

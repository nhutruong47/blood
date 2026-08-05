package com.nhutruong.blood.identity.application;

import com.nhutruong.blood.identity.application.dto.LoginRequest;
import com.nhutruong.blood.identity.application.dto.RegisterRequest;
import com.nhutruong.blood.identity.application.dto.ResetPasswordRequest;
import com.nhutruong.blood.identity.domain.Role;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.identity.domain.UserStatus;
import com.nhutruong.blood.identity.infrastructure.PasswordResetTokenRepository;
import com.nhutruong.blood.identity.infrastructure.UserRepository;
import com.nhutruong.blood.shared.exception.BusinessException;
import com.nhutruong.blood.shared.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private UserProfileService userProfileService;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtTokenProvider jwtTokenProvider;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private CustomUserDetailsService userDetailsService;
    @Mock private PasswordResetTokenRepository passwordResetTokenRepository;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                userProfileService,
                authenticationManager,
                jwtTokenProvider,
                passwordEncoder,
                userDetailsService,
                passwordResetTokenRepository
        );
    }

    // --- registerDonor ---

    @Nested
    @DisplayName("registerDonor")
    class RegisterDonor {

        @Test
        @DisplayName("should register donor successfully")
        void shouldRegisterDonorSuccessfully() {
            RegisterRequest request = new RegisterRequest(
                    "test@example.com", "Test@123456", "Test@123456",
                    "John", "Doe", null
            );
            when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
            when(passwordEncoder.encode("Test@123456")).thenReturn("encoded-password");
            when(userRepository.save(any(User.class))).thenAnswer(inv -> {
                User u = inv.getArgument(0);
                ReflectionTestUtils.setField(u, "id", 1L);
                return u;
            });

            User result = authService.registerDonor(request);

            assertNotNull(result);
            assertEquals("test@example.com", result.getEmail());
            assertEquals("John", result.getFirstName());
            assertEquals("Doe", result.getLastName());
            assertEquals(Role.DONOR, result.getRole());
            assertEquals(UserStatus.ACTIVE, result.getStatus());
            verify(userProfileService).createDefaultProfile(result);
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("should throw exception when passwords do not match")
        void shouldThrowWhenPasswordsDoNotMatch() {
            RegisterRequest request = new RegisterRequest(
                    "test@example.com", "Test@123456", "Wrong@123456",
                    "John", "Doe", null
            );

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> authService.registerDonor(request));

            assertEquals("Password confirmation does not match", ex.getMessage());
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw exception when email already exists")
        void shouldThrowWhenEmailExists() {
            RegisterRequest request = new RegisterRequest(
                    "existing@example.com", "Test@123456", "Test@123456",
                    "John", "Doe", null
            );
            when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> authService.registerDonor(request));

            assertEquals("Email is already registered", ex.getMessage());
            verify(userRepository, never()).save(any());
        }
    }

    // --- login ---

    @Nested
    @DisplayName("login")
    class Login {

        @Test
        @DisplayName("should return JWT token on successful login")
        void shouldReturnTokenOnSuccessfulLogin() {
            LoginRequest request = new LoginRequest("test@example.com", "Test@123456");
            Authentication auth = new UsernamePasswordAuthenticationToken("test@example.com", "Test@123456");
            when(authenticationManager.authenticate(any())).thenReturn(auth);
            when(jwtTokenProvider.generateToken(auth)).thenReturn("jwt-token-xyz");

            String result = authService.login(request);

            assertEquals("jwt-token-xyz", result);
            verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        }

        @Test
        @DisplayName("should propagate BadCredentialsException on failed login")
        void shouldThrowOnBadCredentials() {
            LoginRequest request = new LoginRequest("bad@example.com", "WrongPassword");
            when(authenticationManager.authenticate(any()))
                    .thenThrow(new BadCredentialsException("Bad credentials"));

            assertThrows(BadCredentialsException.class, () -> authService.login(request));
        }
    }

    // --- redirectFor ---

    @Nested
    @DisplayName("redirectFor")
    class RedirectFor {

        @Test
        @DisplayName("should return correct dashboard path for each role")
        void shouldReturnCorrectPathForEachRole() {
            assertEquals("/dashboardAdmin", authService.redirectFor(Role.ADMIN));
            assertEquals("/dashboardAdmin", authService.redirectFor(Role.SUPER_ADMIN));
            assertEquals("/dashboardStaff", authService.redirectFor(Role.STAFF));
            assertEquals("/dashboardStaff", authService.redirectFor(Role.MEDICAL_STAFF));
            assertEquals("/dashboardStaff", authService.redirectFor(Role.LAB_STAFF));
            assertEquals("/dashboardHospital", authService.redirectFor(Role.HOSPITAL));
            assertEquals("/dashboardMedicalcenter", authService.redirectFor(Role.MEDICALCENTER));
            assertEquals("/dashboardCourier", authService.redirectFor(Role.COURIER));
            assertEquals("/dashboardVolunteer", authService.redirectFor(Role.VOLUNTEER));
            assertEquals("/home", authService.redirectFor(Role.DONOR));
            assertEquals("/request-blood", authService.redirectFor(Role.RECIPIENT));
        }
    }

    // --- requestPasswordReset ---

    @Nested
    @DisplayName("requestPasswordReset")
    class RequestPasswordReset {

        @Test
        @DisplayName("should create token and not throw when user exists")
        void shouldCreateTokenWhenUserExists() {
            User user = new User();
            ReflectionTestUtils.setField(user, "id", 42L);
            user.setEmail("existing@example.com");

            when(userRepository.findByEmail("existing@example.com")).thenReturn(Optional.of(user));
            when(passwordResetTokenRepository.save(any())).thenAnswer(inv -> {
                var t = inv.getArgument(0, com.nhutruong.blood.identity.domain.PasswordResetToken.class);
                ReflectionTestUtils.setField(t, "id", 99L);
                return t;
            });

            // Should NOT throw — even if email doesn't exist (email enumeration prevention)
            assertDoesNotThrow(() -> authService.requestPasswordReset("existing@example.com"));

            verify(passwordResetTokenRepository).deleteByUserId(42L);
            verify(passwordResetTokenRepository).save(any(com.nhutruong.blood.identity.domain.PasswordResetToken.class));
        }

        @Test
        @DisplayName("should not throw when email does not exist (enumeration prevention)")
        void shouldNotThrowWhenEmailNotFound() {
            when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

            // Must NOT throw — same message regardless of whether email exists
            assertDoesNotThrow(() -> authService.requestPasswordReset("nonexistent@example.com"));
            verify(passwordResetTokenRepository, never()).save(any());
        }
    }

    // --- resetPassword ---

    @Nested
    @DisplayName("resetPassword")
    class ResetPassword {

        @Test
        @DisplayName("should throw when passwords do not match")
        void shouldThrowWhenPasswordsDoNotMatch() {
            ResetPasswordRequest request = new ResetPasswordRequest("token-xyz", "New@Pass123", "Different@Pass");

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> authService.resetPassword(request));

            assertEquals("Password confirmation does not match", ex.getMessage());
        }

        @Test
        @DisplayName("should throw when token is invalid")
        void shouldThrowWhenTokenInvalid() {
            ResetPasswordRequest request = new ResetPasswordRequest("invalid-token", "New@Pass123", "New@Pass123");
            when(passwordResetTokenRepository.findByToken("invalid-token")).thenReturn(Optional.empty());

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> authService.resetPassword(request));

            assertEquals("Invalid or expired reset token", ex.getMessage());
        }

        @Test
        @DisplayName("should reset password and mark token as used")
        void shouldResetPasswordAndMarkTokenUsed() {
            User user = new User();
            ReflectionTestUtils.setField(user, "id", 42L);
            user.setEmail("user@example.com");
            user.setPassword("old-hash");

            com.nhutruong.blood.identity.domain.PasswordResetToken token =
                    new com.nhutruong.blood.identity.domain.PasswordResetToken();
            ReflectionTestUtils.setField(token, "id", 7L);
            token.setUser(user);
            token.setExpiryDate(java.time.LocalDateTime.now().plusHours(1));
            // Token is valid by default (not expired, not used)

            when(passwordResetTokenRepository.findByToken("valid-token")).thenReturn(Optional.of(token));
            when(passwordEncoder.encode("New@Pass123")).thenReturn("new-hash");
            when(userRepository.save(any(User.class))).thenReturn(user);
            when(passwordResetTokenRepository.save(any())).thenReturn(token);

            ResetPasswordRequest request = new ResetPasswordRequest("valid-token", "New@Pass123", "New@Pass123");
            authService.resetPassword(request);

            assertEquals("new-hash", user.getPassword());
            assertTrue(token.isUsed());
            verify(userDetailsService).evictUser("user@example.com");
        }
    }

    // --- updateMe ---

    @Nested
    @DisplayName("updateMe")
    class UpdateMe {

        @Test
        @DisplayName("should update first and last name")
        void shouldUpdateName() {
            User principal = new User();
            ReflectionTestUtils.setField(principal, "id", 1L);
            principal.setEmail("user@example.com");

            User savedUser = new User();
            ReflectionTestUtils.setField(savedUser, "id", 1L);
            savedUser.setEmail("user@example.com");

            when(userRepository.findById(1L)).thenReturn(Optional.of(savedUser));
            when(userRepository.save(any(User.class))).thenReturn(savedUser);

            com.nhutruong.blood.identity.application.dto.UpdateMeRequest request =
                    new com.nhutruong.blood.identity.application.dto.UpdateMeRequest("NewFirst", "NewLast", null, null);

            User result = authService.updateMe(principal, request);

            assertEquals("NewFirst", result.getFirstName());
            assertEquals("NewLast", result.getLastName());
            verify(userDetailsService).evictUser("user@example.com");
        }
    }

    // --- changePassword ---

    @Nested
    @DisplayName("changePassword")
    class ChangePassword {

        @Test
        @DisplayName("should throw when current password is wrong")
        void shouldThrowWhenCurrentPasswordWrong() {
            User principal = new User();
            ReflectionTestUtils.setField(principal, "id", 1L);
            principal.setPassword("hashed-current");

            when(passwordEncoder.matches("wrong-current", "hashed-current")).thenReturn(false);

            com.nhutruong.blood.identity.application.dto.ChangePasswordRequest request =
                    new com.nhutruong.blood.identity.application.dto.ChangePasswordRequest(
                            "wrong-current", "New@Pass123");

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> authService.changePassword(principal, request));

            assertEquals("Current password is incorrect", ex.getMessage());
        }

        @Test
        @DisplayName("should throw when new password same as current")
        void shouldThrowWhenNewPasswordSameAsCurrent() {
            User principal = new User();
            ReflectionTestUtils.setField(principal, "id", 1L);
            principal.setPassword("hashed-same");

            when(passwordEncoder.matches("same-password", "hashed-same")).thenReturn(true);

            com.nhutruong.blood.identity.application.dto.ChangePasswordRequest request =
                    new com.nhutruong.blood.identity.application.dto.ChangePasswordRequest(
                            "same-password", "same-password");

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> authService.changePassword(principal, request));

            assertEquals("New password must be different from the current password", ex.getMessage());
        }
    }
}

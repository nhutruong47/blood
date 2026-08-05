package com.nhutruong.blood.identity.application;

import com.nhutruong.blood.identity.application.dto.ChangePasswordRequest;
import com.nhutruong.blood.identity.application.dto.LoginRequest;
import com.nhutruong.blood.identity.application.dto.RegisterRequest;
import com.nhutruong.blood.identity.application.dto.ResetPasswordRequest;
import com.nhutruong.blood.identity.application.dto.UpdateMeRequest;
import com.nhutruong.blood.identity.domain.PasswordResetToken;
import com.nhutruong.blood.identity.domain.Role;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.identity.domain.UserStatus;
import com.nhutruong.blood.identity.infrastructure.PasswordResetTokenRepository;
import com.nhutruong.blood.identity.infrastructure.UserRepository;
import com.nhutruong.blood.shared.exception.BusinessException;
import com.nhutruong.blood.shared.exception.ErrorCode;
import com.nhutruong.blood.shared.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository userRepository;
    private final UserProfileService userProfileService;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final CustomUserDetailsService userDetailsService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    public AuthService(
            UserRepository userRepository,
            UserProfileService userProfileService,
            AuthenticationManager authenticationManager,
            JwtTokenProvider jwtTokenProvider,
            PasswordEncoder passwordEncoder,
            CustomUserDetailsService userDetailsService,
            PasswordResetTokenRepository passwordResetTokenRepository
    ) {
        this.userRepository = userRepository;
        this.userProfileService = userProfileService;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.userDetailsService = userDetailsService;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
    }

    @Transactional
    public User registerDonor(RegisterRequest request) {
        if (!request.password().equals(request.confirmPassword())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Password confirmation does not match");
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException(ErrorCode.CONFLICT, "Email is already registered");
        }

        User user = new User();
        user.setEmail(request.email().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setBloodGroup(request.bloodGroup());
        user.setRole(Role.DONOR);
        user.setStatus(UserStatus.ACTIVE);

        User saved = userRepository.save(user);
        userProfileService.createDefaultProfile(saved);
        return saved;
    }

    @Transactional
    public String login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        return jwtTokenProvider.generateToken(authentication);
    }

    public String redirectFor(Role role) {
        return switch (role) {
            case ADMIN -> "/dashboardAdmin";
            case SUPER_ADMIN -> "/dashboardAdmin";
            case STAFF -> "/dashboardStaff";
            case MEDICAL_STAFF -> "/dashboardStaff";
            case LAB_STAFF -> "/dashboardStaff";
            case HOSPITAL -> "/dashboardHospital";
            case MEDICALCENTER -> "/dashboardMedicalcenter";
            case COURIER -> "/dashboardCourier";
            case VOLUNTEER -> "/dashboardVolunteer";
            case DONOR -> "/home";
            case RECIPIENT -> "/request-blood";
        };
    }

    @Transactional
    public void requestPasswordReset(String email) {
        String normalizedEmail = email.trim().toLowerCase();
        userRepository.findByEmail(normalizedEmail).ifPresent(user -> {
            // Invalidate any existing tokens for this user
            passwordResetTokenRepository.deleteByUserId(user.getId());
            // Create a new token
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setUser(user);
            passwordResetTokenRepository.save(resetToken);
            // TODO: Send email with resetToken.getToken()
            // In production, integrate with SMTP/SendGrid/SES here.
            // The token should be sent via email: e.g., POST to email service
            // with link: /api/reset-password?token={token.getToken()}
            log.info("Password reset token created for user {}, tokenId={}", user.getId(), resetToken.getId());
        });
        // Always return success to prevent email enumeration attacks
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Password confirmation does not match");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.token())
                .orElseThrow(() -> new BusinessException(ErrorCode.VALIDATION_ERROR, "Invalid or expired reset token"));

        if (!resetToken.isValid()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Reset token has expired or was already used");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        // Mark token as used and evict from auth cache
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
        userDetailsService.evictUser(user.getEmail());

        log.info("Password successfully reset for user {}", user.getId());
    }

    @Transactional
    public User updateMe(User principal, UpdateMeRequest request) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "User not found"));
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        User saved = userRepository.save(user);
        userDetailsService.evictUser(saved.getEmail());
        return saved;
    }

    @Transactional
    public void changePassword(User principal, ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.currentPassword(), principal.getPassword())) {
            throw new BusinessException(ErrorCode.UNAUTHENTICATED, "Current password is incorrect");
        }
        if (request.currentPassword().equals(request.newPassword())) {
            throw new BusinessException(
                    ErrorCode.VALIDATION_ERROR,
                    "New password must be different from the current password"
            );
        }
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "User not found"));
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        userDetailsService.evictUser(user.getEmail());
    }
}

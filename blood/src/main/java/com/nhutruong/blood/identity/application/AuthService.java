package com.nhutruong.blood.identity.application;

import com.nhutruong.blood.identity.application.dto.LoginRequest;
import com.nhutruong.blood.identity.application.dto.RegisterRequest;
import com.nhutruong.blood.identity.domain.Role;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.identity.domain.UserStatus;
import com.nhutruong.blood.identity.infrastructure.UserRepository;
import com.nhutruong.blood.shared.exception.BusinessException;
import com.nhutruong.blood.shared.exception.ErrorCode;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
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

        return userRepository.save(user);
    }

    @Transactional
    public User login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHENTICATED, "Invalid email or password"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Account is not active");
        }

        if (!matchesPassword(request.password(), user.getPassword())) {
            throw new BusinessException(ErrorCode.UNAUTHENTICATED, "Invalid email or password");
        }

        if (!user.getPassword().startsWith("$2")) {
            user.setPassword(passwordEncoder.encode(request.password()));
            userRepository.save(user);
        }

        return user;
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

    private boolean matchesPassword(String rawPassword, String storedPassword) {
        if (storedPassword == null) {
            return false;
        }
        if (storedPassword.startsWith("$2")) {
            return passwordEncoder.matches(rawPassword, storedPassword);
        }
        return rawPassword.equals(storedPassword);
    }
}

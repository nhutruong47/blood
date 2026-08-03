package com.nhutruong.blood.service.imple;

import com.nhutruong.blood.dto.RegisterRequest;
import com.nhutruong.blood.entity.Role;
import com.nhutruong.blood.entity.User;
import com.nhutruong.blood.enums.UserStatus;
import com.nhutruong.blood.exception.ConflictException;
import com.nhutruong.blood.exception.CustomException;
import com.nhutruong.blood.exception.ForbiddenException;
import com.nhutruong.blood.repository.UserRepository;
import com.nhutruong.blood.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImple implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImple(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User login(String email, String password) {
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            throw new CustomException("Email and password are required");
        }

        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new CustomException("Invalid email or password");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ForbiddenException("Account is not active");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new CustomException("Invalid email or password");
        }

        return user;
    }

    @Override
    public User register(RegisterRequest request) {
        if (!request.password().equals(request.confirmPassword())) {
            throw new CustomException("Password confirmation does not match");
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email is already registered");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setBloodGroup(request.bloodGroup());
        user.setRole(Role.DONOR);
        user.setStatus(UserStatus.ACTIVE);
        return userRepository.save(user);
    }
}

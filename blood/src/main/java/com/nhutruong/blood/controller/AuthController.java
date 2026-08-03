package com.nhutruong.blood.controller;

import com.nhutruong.blood.dto.ApiResponse;
import com.nhutruong.blood.dto.LoginRequest;
import com.nhutruong.blood.dto.LoginResponse;
import com.nhutruong.blood.dto.MessageResponse;
import com.nhutruong.blood.dto.RegisterRequest;
import com.nhutruong.blood.dto.UserResponse;
import com.nhutruong.blood.entity.User;
import com.nhutruong.blood.exception.UnauthorizedException;
import com.nhutruong.blood.security.SessionAuthenticationFilter;
import com.nhutruong.blood.service.imple.AuthServiceImple;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class AuthController {

    private final AuthServiceImple authService;

    public AuthController(AuthServiceImple authService) {
        this.authService = authService;
    }

    @PostMapping("/api/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Registration successful", UserResponse.from(user)));
    }

    @PostMapping("/api/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        User loginUser = authService.login(request.email(), request.password());
        HttpSession session = servletRequest.getSession(true);
        servletRequest.changeSessionId();
        session.setAttribute(SessionAuthenticationFilter.CURRENT_USER, loginUser);

        var authority = new SimpleGrantedAuthority("ROLE_" + loginUser.getRole().name());
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(loginUser, null, List.of(authority))
        );

        String redirectUrl = switch (loginUser.getRole().name()) {
            case "ADMIN" -> "/dashboardAdmin";
            case "STAFF" -> "/dashboardStaff";
            case "MEDICALCENTER" -> "/dashboardMedicalcenter";
            case "DONOR" -> "/home";
            default -> "/unknown-role";
        };
        return ApiResponse.ok("Login successful", new LoginResponse(redirectUrl, UserResponse.from(loginUser)));
    }

    @GetMapping("/api/me")
    public ApiResponse<UserResponse> me(HttpSession session) {
        Object user = session.getAttribute(SessionAuthenticationFilter.CURRENT_USER);
        if (!(user instanceof User currentUser)) {
            throw new UnauthorizedException("Authentication is required");
        }
        return ApiResponse.ok("Current user", UserResponse.from(currentUser));
    }

    @PostMapping("/api/logout")
    public ApiResponse<MessageResponse> logout(HttpSession session) {
        session.invalidate();
        SecurityContextHolder.clearContext();
        return ApiResponse.ok("Logged out", new MessageResponse("Logged out"));
    }
}

package com.nhutruong.blood.identity.api;

import com.nhutruong.blood.identity.application.AuthService;
import com.nhutruong.blood.identity.application.dto.CurrentUserResponse;
import com.nhutruong.blood.identity.application.dto.LoginRequest;
import com.nhutruong.blood.identity.application.dto.LoginResponse;
import com.nhutruong.blood.identity.application.dto.RegisterRequest;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.shared.api.ApiResponse;
import com.nhutruong.blood.shared.security.SessionUser;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ApiResponse<CurrentUserResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.registerDonor(request);
        return ApiResponse.success("Registration successful", CurrentUserResponse.from(user));
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpSession session) {
        User user = authService.login(request);
        SessionUser.store(session, user);
        LoginResponse response = new LoginResponse(CurrentUserResponse.from(user), authService.redirectFor(user.getRole()));
        return ApiResponse.success("Login successful", response);
    }

    @GetMapping("/me")
    public ApiResponse<CurrentUserResponse> me(HttpSession session) {
        User user = SessionUser.requireAuthenticated(session);
        return ApiResponse.success(CurrentUserResponse.from(user));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpSession session) {
        session.invalidate();
        return ApiResponse.success("Logged out", null);
    }
}

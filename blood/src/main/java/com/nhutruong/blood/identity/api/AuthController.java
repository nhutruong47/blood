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

import com.nhutruong.blood.identity.application.RefreshTokenService;
import com.nhutruong.blood.shared.security.JwtTokenProvider;

@RestController
@RequestMapping("/api")
public class AuthController {
    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(AuthService authService, RefreshTokenService refreshTokenService, JwtTokenProvider jwtTokenProvider) {
        this.authService = authService;
        this.refreshTokenService = refreshTokenService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/register")
    public ApiResponse<CurrentUserResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.registerDonor(request);
        return ApiResponse.success("Registration successful", CurrentUserResponse.from(user));
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        String token = authService.login(request);
        User user = (User) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        com.nhutruong.blood.identity.domain.RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
        LoginResponse response = new LoginResponse(token, refreshToken.getToken(), CurrentUserResponse.from(user), authService.redirectFor(user.getRole()));
        return ApiResponse.success("Login successful", response);
    }

    @PostMapping("/refresh")
    public ApiResponse<LoginResponse> refreshtoken(@Valid @RequestBody com.nhutruong.blood.identity.application.dto.TokenRefreshRequest request) {
        String requestRefreshToken = request.refreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(com.nhutruong.blood.identity.domain.RefreshToken::getUser)
                .map(user -> {
                    org.springframework.security.authentication.UsernamePasswordAuthenticationToken authentication =
                            new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                    String token = jwtTokenProvider.generateToken(authentication);
                    com.nhutruong.blood.identity.domain.RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user.getId());
                    return ApiResponse.success("Token refreshed successfully", new LoginResponse(token, newRefreshToken.getToken(), CurrentUserResponse.from(user), authService.redirectFor(user.getRole())));
                })
                .orElseThrow(() -> new com.nhutruong.blood.shared.exception.BusinessException(com.nhutruong.blood.shared.exception.ErrorCode.UNAUTHENTICATED, "Refresh token is not in database!"));
    }

    @GetMapping("/me")
    public ApiResponse<CurrentUserResponse> me() {
        User user = (User) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ApiResponse.success(CurrentUserResponse.from(user));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpSession session) {
        session.invalidate();
        return ApiResponse.success("Logged out", null);
    }
}

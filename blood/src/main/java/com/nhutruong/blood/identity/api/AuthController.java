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
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        String token = authService.login(request);
        
        // Cần truy vấn lại user từ SecurityContextHolder hoặc AuthService nếu cần thông tin chi tiết.
        // Tạm thời để đơn giản, ta sẽ gọi userRepository hoặc sửa AuthService trả về một đối tượng gộp.
        // Tuy nhiên AuthService.login trả về String token. Vậy ta nên trả về LoginResponse với token.
        // Để không phải gọi lại DB, ta sẽ dùng User object từ SecurityContext
        
        User user = (User) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        LoginResponse response = new LoginResponse(token, CurrentUserResponse.from(user), authService.redirectFor(user.getRole()));
        return ApiResponse.success("Login successful", response);
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

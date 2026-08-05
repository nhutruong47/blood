package com.nhutruong.blood.identity.application.dto;

import com.nhutruong.blood.shared.security.StrongPassword;
import jakarta.validation.constraints.NotBlank;

public record ResetPasswordRequest(
        @NotBlank(message = "Token is required") String token,
        @NotBlank(message = "New password is required")
        @StrongPassword String newPassword,
        @NotBlank(message = "Password confirmation is required")
        String confirmPassword
) {
}

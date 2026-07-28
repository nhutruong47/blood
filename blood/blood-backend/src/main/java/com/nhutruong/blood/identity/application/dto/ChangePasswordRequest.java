package com.nhutruong.blood.identity.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Used by POST /api/users/me/change-password. Requires the current password
 * and a new password that follows the strength policy enforced at registration.
 */
public record ChangePasswordRequest(
        @NotBlank String currentPassword,
        @NotBlank @Size(min = 8, max = 128, message = "Password must be at least 8 characters")
        String newPassword
) {
}
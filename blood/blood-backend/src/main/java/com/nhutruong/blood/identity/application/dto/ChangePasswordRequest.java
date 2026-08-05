package com.nhutruong.blood.identity.application.dto;

import com.nhutruong.blood.shared.security.StrongPassword;
import jakarta.validation.constraints.NotBlank;

/**
 * Used by POST /api/users/me/change-password. Requires the current password
 * and a new password that follows the {@link StrongPassword} policy.
 */
public record ChangePasswordRequest(
        @NotBlank String currentPassword,
        @StrongPassword String newPassword
) {
}

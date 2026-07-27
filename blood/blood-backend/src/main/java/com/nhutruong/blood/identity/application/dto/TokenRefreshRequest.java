package com.nhutruong.blood.identity.application.dto;

import jakarta.validation.constraints.NotBlank;

public record TokenRefreshRequest(
        @NotBlank(message = "Refresh Token is required!")
        String refreshToken
) {
}

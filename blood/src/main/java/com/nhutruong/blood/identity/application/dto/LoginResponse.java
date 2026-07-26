package com.nhutruong.blood.identity.application.dto;

public record LoginResponse(
        String accessToken,
        String refreshToken,
        CurrentUserResponse user,
        String redirect
) {
}

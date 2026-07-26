package com.nhutruong.blood.identity.application.dto;

public record LoginResponse(
        String accessToken,
        CurrentUserResponse user,
        String redirect
) {
}

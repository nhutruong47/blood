package com.nhutruong.blood.identity.application.dto;

public record LoginResponse(
        CurrentUserResponse user,
        String redirect
) {
}

package com.nhutruong.blood.organization.application.dto;

import com.nhutruong.blood.identity.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

public record AddMemberRequest(
        @Email @NotNull String email,
        @NotNull Role role
) {
}

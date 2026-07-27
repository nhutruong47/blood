package com.nhutruong.blood.identity.application.dto;

import com.nhutruong.blood.shared.domain.BloodGroup;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @Email @NotBlank String email,
        @NotBlank @Size(min = 8, max = 72) String password,
        @NotBlank @Size(min = 8, max = 72) String confirmPassword,
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotNull BloodGroup bloodGroup
) {
}

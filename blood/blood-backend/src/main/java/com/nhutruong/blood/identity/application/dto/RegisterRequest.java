package com.nhutruong.blood.identity.application.dto;

import com.nhutruong.blood.shared.domain.BloodGroup;
import com.nhutruong.blood.shared.security.StrongPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @Email @NotBlank String email,
        @StrongPassword String password,
        @StrongPassword String confirmPassword,
        @NotBlank @Size(min = 2, max = 64) String firstName,
        @NotBlank @Size(min = 2, max = 64) String lastName,
        @NotNull BloodGroup bloodGroup
) {
}

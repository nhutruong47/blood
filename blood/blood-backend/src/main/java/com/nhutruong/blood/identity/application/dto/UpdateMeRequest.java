package com.nhutruong.blood.identity.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Used by PATCH /api/users/me. Lets the authenticated donor update their
 * own first name, last name, birth date and phone without re-creating the
 * profile row. Other immutable fields (email, role, blood group) are not
 * exposed here.
 */
public record UpdateMeRequest(
        @NotBlank @Size(min = 1, max = 100) String firstName,
        @NotBlank @Size(min = 1, max = 100) String lastName,
        @Size(max = 30) String phone,
        LocalDate birthDate
) {
}
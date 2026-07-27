package com.nhutruong.blood.organization.application.dto;

import com.nhutruong.blood.organization.domain.OrganizationType;
import jakarta.validation.constraints.*;

public record CreateOrganizationRequest(
        @NotBlank String code,
        @NotBlank String name,
        @NotNull OrganizationType type,
        String licenseNumber,
        String phone,
        @Email String email,
        String address,
        @DecimalMin("-90.0") @DecimalMax("90.0") Double latitude,
        @DecimalMin("-180.0") @DecimalMax("180.0") Double longitude
) {
}

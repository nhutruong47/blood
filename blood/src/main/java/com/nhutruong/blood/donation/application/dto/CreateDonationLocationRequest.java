package com.nhutruong.blood.donation.application.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateDonationLocationRequest(
        @NotBlank String name,
        @NotBlank String address,
        @DecimalMin("-90.0") @DecimalMax("90.0") Double latitude,
        @DecimalMin("-180.0") @DecimalMax("180.0") Double longitude,
        @Size(max = 120) String slug,
        @Size(max = 160) String seoTitle,
        @Size(max = 500) String seoDescription,
        Boolean published
) {
}

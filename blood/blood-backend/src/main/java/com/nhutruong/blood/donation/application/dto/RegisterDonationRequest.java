package com.nhutruong.blood.donation.application.dto;

import com.nhutruong.blood.shared.domain.BloodGroup;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record RegisterDonationRequest(
        @NotBlank String medicalCenterName,
        @NotNull @FutureOrPresent LocalDate donationDate,
        @NotNull BloodGroup bloodGroup,
        @NotBlank String healthStatus,
        @DecimalMin("35.0") double weight,
        @Min(250) @Max(500) int amount,
        @Min(16) @Max(70) int age,
        Long scheduleId
) {
    public RegisterDonationRequest(
            String medicalCenterName,
            LocalDate donationDate,
            BloodGroup bloodGroup,
            String healthStatus,
            double weight,
            int amount,
            int age
    ) {
        this(medicalCenterName, donationDate, bloodGroup, healthStatus, weight, amount, age, null);
    }
}

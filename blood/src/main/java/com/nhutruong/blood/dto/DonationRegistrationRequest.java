package com.nhutruong.blood.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public record DonationRegistrationRequest(
        @NotBlank String medicalCenter,
        @NotNull @FutureOrPresent LocalDate donationDate,
        @NotBlank @Pattern(regexp = "^(A|B|AB|O)[+-]$") String bloodGroup,
        @NotBlank String healthStatus,
        @Min(18) @Max(65) int age,
        @Min(45) @Max(200) double weight,
        @Positive int amount
) {
}

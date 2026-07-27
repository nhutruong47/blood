package com.nhutruong.blood.donation.application.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record AddDonationScheduleRequest(
        @NotNull @Future LocalDateTime donationTime,
        @Min(1) Integer capacity
) {
}

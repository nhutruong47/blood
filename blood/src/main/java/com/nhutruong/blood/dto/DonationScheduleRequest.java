package com.nhutruong.blood.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

public record DonationScheduleRequest(
        @NotNull @FutureOrPresent LocalDateTime startTime,
        @NotNull LocalDateTime endTime,
        @Positive Integer capacity
) {
}

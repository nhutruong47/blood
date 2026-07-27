package com.nhutruong.blood.donation.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateAppointmentRequest(
        @NotNull Long scheduleId,
        @NotBlank String donorNotes
) {
}

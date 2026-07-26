package com.nhutruong.blood.emergency.application.dto;

import com.nhutruong.blood.inventory.domain.BloodComponentType;
import com.nhutruong.blood.shared.domain.BloodGroup;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateEmergencyRequest(
        @NotNull BloodGroup bloodGroup,
        @NotNull BloodComponentType componentType,
        @Min(1) int quantityUnits,
        @NotBlank String recipientInfo,
        Double latitude,
        Double longitude
) {
}

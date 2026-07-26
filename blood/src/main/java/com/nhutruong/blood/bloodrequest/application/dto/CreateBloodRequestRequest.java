package com.nhutruong.blood.bloodrequest.application.dto;

import com.nhutruong.blood.bloodrequest.domain.Urgency;
import com.nhutruong.blood.inventory.domain.BloodComponentType;
import com.nhutruong.blood.shared.domain.BloodGroup;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateBloodRequestRequest(
        @NotNull BloodGroup bloodGroup,
        @NotNull Urgency urgency,
        @NotBlank String recipientInfo,
        BloodComponentType componentType,
        @Min(1) Integer quantityUnits,
        Double latitude,
        Double longitude
) {
}

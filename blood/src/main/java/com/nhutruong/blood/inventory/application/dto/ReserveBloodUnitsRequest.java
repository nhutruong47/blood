package com.nhutruong.blood.inventory.application.dto;

import com.nhutruong.blood.inventory.domain.BloodComponentType;
import com.nhutruong.blood.shared.domain.BloodGroup;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ReserveBloodUnitsRequest(
        @NotNull Long bloodRequestId,
        @NotNull BloodGroup bloodGroup,
        @NotNull BloodComponentType componentType,
        @Min(1) int quantity
) {
}

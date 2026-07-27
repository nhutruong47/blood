package com.nhutruong.blood.inventory.application.dto;

import com.nhutruong.blood.inventory.domain.BloodComponentType;
import com.nhutruong.blood.shared.domain.BloodGroup;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreateBloodUnitRequest(
        @NotBlank String bagCode,
        Long donorId,
        @NotNull BloodGroup bloodGroup,
        @NotNull BloodComponentType componentType,
        @NotNull @Min(1) Integer volumeMl,
        @NotNull LocalDate collectionDate,
        @NotNull @Future LocalDate expiryDate,
        String storageLocation
) {
}

package com.nhutruong.blood.dto;

import com.nhutruong.blood.entity.BloodInventory;

import java.time.LocalDateTime;

public record BloodInventoryResponse(
        Long id,
        String bloodGroup,
        int availableAmount,
        int reservedAmount,
        LocalDateTime updatedAt
) {
    public static BloodInventoryResponse from(BloodInventory inventory) {
        return new BloodInventoryResponse(
                inventory.getId(),
                inventory.getBloodGroup(),
                inventory.getAvailableAmount(),
                inventory.getReservedAmount(),
                inventory.getUpdatedAt()
        );
    }
}

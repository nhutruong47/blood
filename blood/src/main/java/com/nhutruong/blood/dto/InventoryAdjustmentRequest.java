package com.nhutruong.blood.dto;

import com.nhutruong.blood.enums.BloodInventoryTransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public record InventoryAdjustmentRequest(
        @NotBlank @Pattern(regexp = "^(A|B|AB|O)[+-]$") String bloodGroup,
        @NotNull BloodInventoryTransactionType transactionType,
        @Positive int amount,
        @NotBlank String note
) {
}

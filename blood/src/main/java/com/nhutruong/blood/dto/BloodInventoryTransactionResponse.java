package com.nhutruong.blood.dto;

import com.nhutruong.blood.entity.BloodInventoryTransaction;
import com.nhutruong.blood.enums.BloodInventoryTransactionType;

import java.time.LocalDateTime;

public record BloodInventoryTransactionResponse(
        Long id,
        String bloodGroup,
        BloodInventoryTransactionType transactionType,
        int amount,
        int balanceBefore,
        int balanceAfter,
        String referenceType,
        Long referenceId,
        Long createdBy,
        LocalDateTime createdAt,
        String note
) {
    public static BloodInventoryTransactionResponse from(BloodInventoryTransaction transaction) {
        return new BloodInventoryTransactionResponse(
                transaction.getId(),
                transaction.getBloodGroup(),
                transaction.getTransactionType(),
                transaction.getAmount(),
                transaction.getBalanceBefore(),
                transaction.getBalanceAfter(),
                transaction.getReferenceType(),
                transaction.getReferenceId(),
                transaction.getCreatedBy() == null ? null : transaction.getCreatedBy().getId(),
                transaction.getCreatedAt(),
                transaction.getNote()
        );
    }
}

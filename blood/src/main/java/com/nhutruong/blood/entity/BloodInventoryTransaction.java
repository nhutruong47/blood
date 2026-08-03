package com.nhutruong.blood.entity;

import com.nhutruong.blood.enums.BloodInventoryTransactionType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
public class BloodInventoryTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String bloodGroup;

    @Enumerated(EnumType.STRING)
    private BloodInventoryTransactionType transactionType;

    private int amount;
    private int balanceBefore;
    private int balanceAfter;
    private String referenceType;
    private Long referenceId;

    @ManyToOne
    private User createdBy;

    private LocalDateTime createdAt;
    private String note;
}

package com.nhutruong.blood.repository;

import com.nhutruong.blood.entity.BloodInventoryTransaction;
import com.nhutruong.blood.enums.BloodInventoryTransactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BloodInventoryTransactionRepository extends JpaRepository<BloodInventoryTransaction, Long> {
    boolean existsByTransactionTypeAndReferenceTypeAndReferenceId(
            BloodInventoryTransactionType transactionType,
            String referenceType,
            Long referenceId
    );

    List<BloodInventoryTransaction> findByBloodGroup(String bloodGroup);
}

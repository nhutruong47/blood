package com.nhutruong.blood.service;

import com.nhutruong.blood.dto.InventoryAdjustmentRequest;
import com.nhutruong.blood.entity.BloodInventory;
import com.nhutruong.blood.entity.BloodInventoryTransaction;
import com.nhutruong.blood.entity.User;
import com.nhutruong.blood.enums.BloodInventoryTransactionType;
import com.nhutruong.blood.exception.BusinessRuleException;
import com.nhutruong.blood.repository.BloodInventoryRepository;
import com.nhutruong.blood.repository.BloodInventoryTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BloodInventoryService {
    private static final String DONATION_REFERENCE = "DonationRegistration";
    private static final String REQUEST_REFERENCE = "BloodRequest";

    private final BloodInventoryRepository inventoryRepository;
    private final BloodInventoryTransactionRepository transactionRepository;
    private final BloodCompatibilityService compatibilityService;

    public BloodInventoryService(
            BloodInventoryRepository inventoryRepository,
            BloodInventoryTransactionRepository transactionRepository,
            BloodCompatibilityService compatibilityService
    ) {
        this.inventoryRepository = inventoryRepository;
        this.transactionRepository = transactionRepository;
        this.compatibilityService = compatibilityService;
    }

    public List<BloodInventory> findAll() {
        return inventoryRepository.findAll();
    }

    public List<BloodInventoryTransaction> findTransactions() {
        return transactionRepository.findAll();
    }

    @Transactional
    public BloodInventory adjust(InventoryAdjustmentRequest request, User actor) {
        if (request.transactionType() != BloodInventoryTransactionType.ADJUSTMENT_IN
                && request.transactionType() != BloodInventoryTransactionType.ADJUSTMENT_OUT) {
            throw new BusinessRuleException("Only inventory adjustment transaction types are allowed");
        }
        int signedAmount = request.transactionType() == BloodInventoryTransactionType.ADJUSTMENT_IN
                ? request.amount()
                : -request.amount();
        return apply(request.bloodGroup(), signedAmount, request.transactionType(), "ManualAdjustment", null, actor, request.note());
    }

    @Transactional
    public BloodInventory recordDonationIn(String bloodGroup, int amount, Long donationRegistrationId, User actor) {
        boolean exists = transactionRepository.existsByTransactionTypeAndReferenceTypeAndReferenceId(
                BloodInventoryTransactionType.DONATION_IN,
                DONATION_REFERENCE,
                donationRegistrationId
        );
        if (exists) {
            return getOrCreateInventory(bloodGroup);
        }
        return apply(bloodGroup, amount, BloodInventoryTransactionType.DONATION_IN, DONATION_REFERENCE, donationRegistrationId, actor,
                "Donation completed");
    }

    @Transactional
    public BloodInventory fulfillRequestOut(String requestedBloodGroup, int amount, Long bloodRequestId, User actor) {
        boolean exists = transactionRepository.existsByTransactionTypeAndReferenceTypeAndReferenceId(
                BloodInventoryTransactionType.REQUEST_OUT,
                REQUEST_REFERENCE,
                bloodRequestId
        );
        if (exists) {
            return findInventoryForFulfillment(requestedBloodGroup, amount);
        }

        BloodInventory inventory = findInventoryForFulfillment(requestedBloodGroup, amount);
        return apply(inventory.getBloodGroup(), -amount, BloodInventoryTransactionType.REQUEST_OUT, REQUEST_REFERENCE, bloodRequestId, actor,
                "Blood request fulfilled for " + requestedBloodGroup);
    }

    public String selectBloodGroupForFulfillment(String requestedBloodGroup, int amount) {
        return findInventoryForFulfillment(requestedBloodGroup, amount).getBloodGroup();
    }

    private BloodInventory findInventoryForFulfillment(String requestedBloodGroup, int amount) {
        if (!compatibilityService.isValidBloodGroup(requestedBloodGroup)) {
            throw new BusinessRuleException("Invalid blood group");
        }
        for (String candidate : compatibilityService.compatibleDonorGroupsForRecipient(requestedBloodGroup)) {
            BloodInventory inventory = getOrCreateInventory(candidate);
            if (inventory.getAvailableAmount() >= amount) {
                return inventory;
            }
        }
        throw new BusinessRuleException("Not enough compatible blood inventory");
    }

    private BloodInventory getOrCreateInventory(String bloodGroup) {
        return inventoryRepository.findByBloodGroup(bloodGroup).orElseGet(() -> {
            BloodInventory inventory = new BloodInventory();
            inventory.setBloodGroup(bloodGroup);
            inventory.setAvailableAmount(0);
            inventory.setReservedAmount(0);
            inventory.setUpdatedAt(LocalDateTime.now());
            return inventoryRepository.save(inventory);
        });
    }

    private BloodInventory apply(
            String bloodGroup,
            int signedAmount,
            BloodInventoryTransactionType transactionType,
            String referenceType,
            Long referenceId,
            User actor,
            String note
    ) {
        BloodInventory inventory = getOrCreateInventory(bloodGroup);
        int before = inventory.getAvailableAmount();
        int after = before + signedAmount;
        if (after < 0) {
            throw new BusinessRuleException("Inventory cannot be negative");
        }
        inventory.setAvailableAmount(after);
        inventory.setUpdatedAt(LocalDateTime.now());
        BloodInventory saved = inventoryRepository.save(inventory);

        BloodInventoryTransaction transaction = new BloodInventoryTransaction();
        transaction.setBloodGroup(bloodGroup);
        transaction.setTransactionType(transactionType);
        transaction.setAmount(Math.abs(signedAmount));
        transaction.setBalanceBefore(before);
        transaction.setBalanceAfter(after);
        transaction.setReferenceType(referenceType);
        transaction.setReferenceId(referenceId);
        transaction.setCreatedBy(actor);
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setNote(note);
        transactionRepository.save(transaction);

        return saved;
    }
}

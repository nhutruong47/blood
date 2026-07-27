package com.nhutruong.blood.inventory.application;

import com.nhutruong.blood.audit.application.AuditService;
import com.nhutruong.blood.bloodrequest.domain.BloodRequest;
import com.nhutruong.blood.bloodrequest.infrastructure.BloodRequestRepository;
import com.nhutruong.blood.donation.application.BloodCompatibilityService;
import com.nhutruong.blood.inventory.domain.BloodComponentType;
import com.nhutruong.blood.inventory.domain.BloodUnit;
import com.nhutruong.blood.inventory.domain.BloodUnitStatus;
import com.nhutruong.blood.inventory.domain.InventoryMovement;
import com.nhutruong.blood.inventory.domain.InventoryMovementType;
import com.nhutruong.blood.inventory.infrastructure.BloodUnitRepository;
import com.nhutruong.blood.inventory.infrastructure.InventoryMovementRepository;
import com.nhutruong.blood.shared.domain.BloodGroup;
import com.nhutruong.blood.shared.exception.BusinessException;
import com.nhutruong.blood.shared.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationService {
    private final BloodUnitRepository bloodUnitRepository;
    private final BloodRequestRepository bloodRequestRepository;
    private final InventoryMovementRepository movementRepository;
    private final AuditService auditService;
    private final BloodCompatibilityService bloodCompatibilityService;

    @Transactional
    public List<BloodUnit> reserve(
            Long bloodRequestId,
            BloodGroup bloodGroup,
            BloodComponentType componentType,
            int quantity
    ) {
        BloodRequest request = bloodRequestRepository.findById(bloodRequestId)
                .orElseThrow(() -> new BusinessException(ErrorCode.VALIDATION_ERROR, "Blood request not found"));

        List<BloodGroup> compatibleGroups = bloodCompatibilityService.getCompatibleDonorGroups(bloodGroup);
        List<BloodUnit> candidates = bloodUnitRepository.findAvailableByBloodGroupsWithLock(compatibleGroups)
                .stream()
                .filter(unit -> unit.getComponentType() == componentType)
                .filter(unit -> unit.getExpiryDate() != null && unit.getExpiryDate().isAfter(LocalDate.now()))
                .toList();

        if (candidates.size() < quantity) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Not enough compatible units. Need " + quantity + ", found " + candidates.size());
        }

        List<BloodUnit> reserved = new ArrayList<>(candidates.subList(0, quantity));
        for (BloodUnit unit : reserved) {
            unit.setStatus(BloodUnitStatus.RESERVED);
            unit.setReservedFor(request);
            bloodUnitRepository.save(unit);

            InventoryMovement movement = new InventoryMovement();
            movement.setBloodUnit(unit);
            movement.setType(InventoryMovementType.RESERVE);
            movement.setFromStatus(BloodUnitStatus.AVAILABLE);
            movement.setToStatus(BloodUnitStatus.RESERVED);
            movement.setReason("Reserved for blood request #" + bloodRequestId);
            movementRepository.save(movement);

            log.info("Reserved blood unit {} for request #{}", unit.getBagCode(), bloodRequestId);
        }

        auditService.log(null, "SYSTEM", com.nhutruong.blood.audit.domain.AuditAction.RESERVE,
                "BloodRequest", String.valueOf(bloodRequestId), "Blood units reserved with pessimistic locking");
        return reserved;
    }

    @Transactional
    public void releaseReservation(Long bloodRequestId, String reason) {
        List<BloodUnit> units = bloodUnitRepository.findByReservedForId(bloodRequestId);
        for (BloodUnit unit : units) {
            unit.setStatus(BloodUnitStatus.AVAILABLE);
            unit.setReservedFor(null);
            bloodUnitRepository.save(unit);

            InventoryMovement movement = new InventoryMovement();
            movement.setBloodUnit(unit);
            movement.setType(InventoryMovementType.RELEASE_RESERVATION);
            movement.setFromStatus(BloodUnitStatus.RESERVED);
            movement.setToStatus(BloodUnitStatus.AVAILABLE);
            movement.setReason(reason);
            movementRepository.save(movement);
        }
        if (!units.isEmpty()) {
            auditService.log(null, "SYSTEM", com.nhutruong.blood.audit.domain.AuditAction.RELEASE,
                    "BloodRequest", String.valueOf(bloodRequestId), reason);
        }
        log.info("Released {} units from request #{}", units.size(), bloodRequestId);
    }
}

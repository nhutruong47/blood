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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {
    private static final Logger log = LoggerFactory.getLogger(ReservationService.class);
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

        // Mark all units as reserved
        reserved.forEach(unit -> {
            unit.setStatus(BloodUnitStatus.RESERVED);
            unit.setReservedFor(request);
        });
        // Batch save — single INSERT/UPDATE round-trip instead of N individual saves
        bloodUnitRepository.saveAll(reserved);

        // Batch-create inventory movements for all reserved units
        List<InventoryMovement> movements = reserved.stream()
                .map(unit -> {
                    InventoryMovement movement = new InventoryMovement();
                    movement.setBloodUnit(unit);
                    movement.setType(InventoryMovementType.RESERVE);
                    movement.setFromStatus(BloodUnitStatus.AVAILABLE);
                    movement.setToStatus(BloodUnitStatus.RESERVED);
                    movement.setReason("Reserved for blood request #" + bloodRequestId);
                    return movement;
                })
                .toList();
        movementRepository.saveAll(movements);

        auditService.log(null, "SYSTEM", com.nhutruong.blood.audit.domain.AuditAction.RESERVE,
                "BloodRequest", String.valueOf(bloodRequestId), "Blood units reserved with pessimistic locking");
        return reserved;
    }

    @Transactional
    public void releaseReservation(Long bloodRequestId, String reason) {
        List<BloodUnit> units = bloodUnitRepository.findByReservedForId(bloodRequestId);
        if (units.isEmpty()) {
            return;
        }

        units.forEach(unit -> {
            unit.setStatus(BloodUnitStatus.AVAILABLE);
            unit.setReservedFor(null);
        });
        // Batch save — single UPDATE round-trip instead of N individual saves
        bloodUnitRepository.saveAll(units);

        List<InventoryMovement> movements = units.stream()
                .map(unit -> {
                    InventoryMovement movement = new InventoryMovement();
                    movement.setBloodUnit(unit);
                    movement.setType(InventoryMovementType.RELEASE_RESERVATION);
                    movement.setFromStatus(BloodUnitStatus.RESERVED);
                    movement.setToStatus(BloodUnitStatus.AVAILABLE);
                    movement.setReason(reason);
                    return movement;
                })
                .toList();
        movementRepository.saveAll(movements);

        auditService.log(null, "SYSTEM", com.nhutruong.blood.audit.domain.AuditAction.RELEASE,
                "BloodRequest", String.valueOf(bloodRequestId), reason);
        log.info("Released {} units from request #{}", units.size(), bloodRequestId);
    }
}

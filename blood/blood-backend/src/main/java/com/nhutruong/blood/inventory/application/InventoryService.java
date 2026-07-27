package com.nhutruong.blood.inventory.application;

import com.nhutruong.blood.audit.application.AuditService;
import com.nhutruong.blood.audit.domain.AuditAction;
import com.nhutruong.blood.bloodrequest.domain.BloodRequest;
import com.nhutruong.blood.bloodrequest.infrastructure.BloodRequestRepository;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.identity.infrastructure.UserRepository;
import com.nhutruong.blood.inventory.application.dto.CreateBloodUnitRequest;
import com.nhutruong.blood.inventory.application.dto.RecordLabTestRequest;
import com.nhutruong.blood.inventory.application.dto.ReserveBloodUnitsRequest;
import com.nhutruong.blood.inventory.application.dto.StockSummaryResponse;
import com.nhutruong.blood.inventory.domain.*;
import com.nhutruong.blood.inventory.infrastructure.BloodUnitRepository;
import com.nhutruong.blood.inventory.infrastructure.InventoryMovementRepository;
import com.nhutruong.blood.inventory.infrastructure.LabTestRepository;
import com.nhutruong.blood.shared.domain.BloodGroup;
import com.nhutruong.blood.shared.exception.BusinessException;
import com.nhutruong.blood.shared.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class InventoryService {
    private final BloodUnitRepository bloodUnitRepository;
    private final LabTestRepository labTestRepository;
    private final InventoryMovementRepository movementRepository;
    private final UserRepository userRepository;
    private final BloodRequestRepository bloodRequestRepository;
    private final AuditService auditService;

    public InventoryService(
            BloodUnitRepository bloodUnitRepository,
            LabTestRepository labTestRepository,
            InventoryMovementRepository movementRepository,
            UserRepository userRepository,
            BloodRequestRepository bloodRequestRepository,
            AuditService auditService
    ) {
        this.bloodUnitRepository = bloodUnitRepository;
        this.labTestRepository = labTestRepository;
        this.movementRepository = movementRepository;
        this.userRepository = userRepository;
        this.bloodRequestRepository = bloodRequestRepository;
        this.auditService = auditService;
    }

    @Transactional
    public BloodUnit createUnit(CreateBloodUnitRequest request) {
        String bagCode = request.bagCode().trim().toUpperCase();
        if (bloodUnitRepository.existsByBagCode(bagCode)) {
            throw new BusinessException(ErrorCode.CONFLICT, "Blood bag code already exists");
        }
        if (request.expiryDate().isBefore(request.collectionDate())) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Expiry date must be after collection date");
        }

        BloodUnit unit = new BloodUnit();
        unit.setBagCode(bagCode);
        unit.setDonor(resolveDonor(request.donorId()));
        unit.setBloodGroup(request.bloodGroup());
        unit.setComponentType(request.componentType());
        unit.setVolumeMl(request.volumeMl());
        unit.setCollectionDate(request.collectionDate());
        unit.setExpiryDate(request.expiryDate());
        unit.setStorageLocation(request.storageLocation());
        unit.setStatus(BloodUnitStatus.QUARANTINED);
        unit.setLabTestResult(LabTestResult.PENDING);

        BloodUnit saved = bloodUnitRepository.save(unit);
        recordMovement(saved, InventoryMovementType.COLLECT, null, BloodUnitStatus.QUARANTINED, "Blood unit collected and quarantined");
        auditService.record(null, AuditAction.CREATE, "BloodUnit", saved.getId(), "Blood unit created");
        return saved;
    }

    @Transactional
    public BloodUnit recordLabTest(Long bloodUnitId, RecordLabTestRequest request) {
        BloodUnit unit = getUnit(bloodUnitId);
        if (unit.getStatus() == BloodUnitStatus.DESTROYED || unit.getStatus() == BloodUnitStatus.DISPATCHED) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Cannot test blood unit in current status");
        }

        LabTest test = new LabTest();
        test.setBloodUnit(unit);
        test.setTestType(request.testType().trim());
        test.setResult(request.result());
        test.setNotes(request.notes());
        labTestRepository.save(test);

        BloodUnitStatus previous = unit.getStatus();
        unit.setLabTestResult(request.result());
        if (request.result() == LabTestResult.PASSED) {
            unit.setStatus(BloodUnitStatus.AVAILABLE);
            recordMovement(unit, InventoryMovementType.RELEASE, previous, BloodUnitStatus.AVAILABLE, "Lab test passed");
        } else if (request.result() == LabTestResult.FAILED) {
            unit.setStatus(BloodUnitStatus.REJECTED);
            recordMovement(unit, InventoryMovementType.TEST, previous, BloodUnitStatus.REJECTED, "Lab test failed");
        } else {
            unit.setStatus(BloodUnitStatus.TESTING);
            recordMovement(unit, InventoryMovementType.TEST, previous, BloodUnitStatus.TESTING, "Lab test pending");
        }

        BloodUnit saved = bloodUnitRepository.save(unit);
        auditService.record(null, AuditAction.UPDATE, "BloodUnit", saved.getId(), "Lab test recorded");
        return saved;
    }

    @Transactional
    public List<BloodUnit> reserve(ReserveBloodUnitsRequest request) {
        BloodRequest bloodRequest = bloodRequestRepository.findById(request.bloodRequestId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Blood request not found"));

        // Verify blood compatibility
        BloodGroup requestBloodGroup = request.bloodGroup();
        List<BloodGroup> compatibleGroups = getCompatibleBloodGroups(requestBloodGroup);

        List<BloodUnit> candidates = new ArrayList<>();
        for (BloodGroup bg : compatibleGroups) {
            List<BloodUnit> units = bloodUnitRepository
                    .findByBloodGroupAndComponentTypeAndStatusAndExpiryDateGreaterThanEqualOrderByExpiryDateAsc(
                            bg,
                            request.componentType(),
                            BloodUnitStatus.AVAILABLE,
                            LocalDate.now()
                    );
            candidates.addAll(units);
        }

        if (candidates.size() < request.quantity()) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Not enough available stock to reserve");
        }

        List<BloodUnit> reserved = candidates.stream().limit(request.quantity()).toList();
        for (BloodUnit unit : reserved) {
            BloodUnitStatus previous = unit.getStatus();
            unit.setStatus(BloodUnitStatus.RESERVED);
            unit.setReservedFor(bloodRequest);
            recordMovement(unit, InventoryMovementType.RESERVE, previous, BloodUnitStatus.RESERVED, "Reserved for request #" + bloodRequest.getId());
        }
        List<BloodUnit> saved = bloodUnitRepository.saveAll(reserved);
        auditService.record(null, AuditAction.RESERVE, "BloodRequest", bloodRequest.getId(), "Blood units reserved by FEFO");
        return saved;
    }

    @Transactional(readOnly = true)
    public boolean canReserve(ReserveBloodUnitsRequest request) {
        long available = bloodUnitRepository
                .findByBloodGroupAndComponentTypeAndStatusAndExpiryDateGreaterThanEqualOrderByExpiryDateAsc(
                        request.bloodGroup(),
                        request.componentType(),
                        BloodUnitStatus.AVAILABLE,
                        LocalDate.now()
                )
                .size();
        return available >= request.quantity();
    }

    @Transactional
    public BloodUnit dispatch(Long bloodUnitId) {
        BloodUnit unit = getUnit(bloodUnitId);
        if (unit.getStatus() != BloodUnitStatus.RESERVED) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Only reserved blood units can be dispatched");
        }
        BloodUnitStatus previous = unit.getStatus();
        unit.setStatus(BloodUnitStatus.DISPATCHED);
        recordMovement(unit, InventoryMovementType.DISPATCH, previous, BloodUnitStatus.DISPATCHED, "Blood unit dispatched");
        BloodUnit saved = bloodUnitRepository.save(unit);
        auditService.record(null, AuditAction.DISPATCH, "BloodUnit", saved.getId(), "Blood unit dispatched");
        return saved;
    }

    @Transactional(readOnly = true)
    public List<StockSummaryResponse> stock() {
        List<Object[]> results = bloodUnitRepository.getStockSummary();
        List<StockSummaryResponse> summaries = new ArrayList<>();

        for (Object[] row : results) {
            BloodGroup bloodGroup = (BloodGroup) row[0];
            BloodComponentType componentType = (BloodComponentType) row[1];
            BloodUnitStatus status = (BloodUnitStatus) row[2];
            Long count = (Long) row[3];
            Long volume = (Long) row[4];

            summaries.add(new StockSummaryResponse(
                    bloodGroup,
                    componentType,
                    status,
                    count != null ? count : 0L,
                    volume != null ? volume : 0L
            ));
        }
        return summaries;
    }

    private BloodUnit getUnit(Long id) {
        return bloodUnitRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Blood unit not found"));
    }

    private User resolveDonor(Long donorId) {
        if (donorId == null) {
            return null;
        }
        return userRepository.findById(donorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Donor not found"));
    }

    private void recordMovement(
            BloodUnit unit,
            InventoryMovementType type,
            BloodUnitStatus fromStatus,
            BloodUnitStatus toStatus,
            String reason
    ) {
        InventoryMovement movement = new InventoryMovement();
        movement.setBloodUnit(unit);
        movement.setType(type);
        movement.setFromStatus(fromStatus);
        movement.setToStatus(toStatus);
        movement.setReason(reason);
        movementRepository.save(movement);
    }

    /**
     * Get compatible blood groups for transfusion.
     * Universal donor: O- can give to all.
     * Universal recipient: AB+ can receive from all.
     */
    private List<BloodGroup> getCompatibleBloodGroups(BloodGroup requested) {
        return switch (requested) {
            case O_NEGATIVE -> List.of(BloodGroup.O_NEGATIVE);
            case O_POSITIVE -> List.of(BloodGroup.O_NEGATIVE, BloodGroup.O_POSITIVE);
            case A_NEGATIVE -> List.of(BloodGroup.O_NEGATIVE, BloodGroup.A_NEGATIVE);
            case A_POSITIVE -> List.of(BloodGroup.O_NEGATIVE, BloodGroup.O_POSITIVE, BloodGroup.A_NEGATIVE, BloodGroup.A_POSITIVE);
            case B_NEGATIVE -> List.of(BloodGroup.O_NEGATIVE, BloodGroup.B_NEGATIVE);
            case B_POSITIVE -> List.of(BloodGroup.O_NEGATIVE, BloodGroup.O_POSITIVE, BloodGroup.B_NEGATIVE, BloodGroup.B_POSITIVE);
            case AB_NEGATIVE -> List.of(BloodGroup.O_NEGATIVE, BloodGroup.A_NEGATIVE, BloodGroup.B_NEGATIVE, BloodGroup.AB_NEGATIVE);
            case AB_POSITIVE -> List.of(BloodGroup.O_NEGATIVE, BloodGroup.O_POSITIVE, BloodGroup.A_NEGATIVE, BloodGroup.A_POSITIVE,
                    BloodGroup.B_NEGATIVE, BloodGroup.B_POSITIVE, BloodGroup.AB_NEGATIVE, BloodGroup.AB_POSITIVE);
        };
    }
}

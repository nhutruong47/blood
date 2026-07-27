package com.nhutruong.blood.shipment.application;

import com.nhutruong.blood.audit.application.AuditService;
import com.nhutruong.blood.audit.domain.AuditAction;
import com.nhutruong.blood.bloodrequest.domain.BloodRequest;
import com.nhutruong.blood.bloodrequest.domain.BloodRequestStatus;
import com.nhutruong.blood.bloodrequest.infrastructure.BloodRequestRepository;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.shipment.domain.Shipment;
import com.nhutruong.blood.shipment.infrastructure.ShipmentRepository;
import com.nhutruong.blood.shared.exception.BusinessException;
import com.nhutruong.blood.shared.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShipmentService {
    private final ShipmentRepository shipmentRepository;
    private final BloodRequestRepository bloodRequestRepository;
    private final AuditService auditService;

    @Transactional
    public Shipment create(Long bloodRequestId, String courierName, String courierPhone, String notes, User staff) {
        BloodRequest request = bloodRequestRepository.findById(bloodRequestId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Blood request not found"));

        if (request.getStatus() != BloodRequestStatus.RESERVED) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Blood request must be RESERVED before creating shipment. Current status: " + request.getStatus());
        }

        Shipment shipment = Shipment.builder()
                .bloodRequest(request)
                .courierName(courierName)
                .courierPhone(courierPhone)
                .notes(notes)
                .status(Shipment.ShipmentStatus.CREATED)
                .build();

        Shipment saved = shipmentRepository.save(shipment);
        auditService.log(staff.getId(), staff.getRole().name(), AuditAction.CREATE,
                "Shipment", String.valueOf(saved.getId()),
                "Shipment created for request #" + bloodRequestId);

        log.info("Shipment #{} created for request #{} by staff {}", saved.getId(), bloodRequestId, staff.getId());
        return saved;
    }

    @Transactional
    public Shipment markPickedUp(Long shipmentId, Double temperature, User staff) {
        Shipment shipment = getShipment(shipmentId);
        shipment.setStatus(Shipment.ShipmentStatus.PICKED_UP);
        shipment.setPickedUpAt(LocalDateTime.now());
        shipment.setTemperatureAtPickup(temperature);
        shipment.addCheckpoint("Pickup location", "Package picked up by courier", temperature);

        Shipment saved = shipmentRepository.save(shipment);
        auditService.log(staff.getId(), staff.getRole().name(), AuditAction.UPDATE,
                "Shipment", String.valueOf(saved.getId()), "Shipment picked up");

        log.info("Shipment #{} picked up by courier {}", saved.getId(), shipment.getCourierName());
        return saved;
    }

    @Transactional
    public Shipment addCheckpoint(Long shipmentId, String location, String description, Double temperature, User staff) {
        Shipment shipment = getShipment(shipmentId);
        shipment.addCheckpoint(location, description, temperature);
        shipment.setStatus(Shipment.ShipmentStatus.IN_TRANSIT);
        Shipment saved = shipmentRepository.save(shipment);
        log.info("Checkpoint added to shipment #{}: {} at {}", saved.getId(), description, location);
        return saved;
    }

    @Transactional
    public Shipment confirmDelivery(Long shipmentId, String receivedBy, String notes, User staff) {
        Shipment shipment = getShipment(shipmentId);
        shipment.setStatus(Shipment.ShipmentStatus.DELIVERED);
        shipment.setDeliveredAt(LocalDateTime.now());
        shipment.addCheckpoint("Hospital: " + receivedBy, "Package delivered", null);
        if (notes != null) {
            shipment.setNotes(notes);
        }

        BloodRequest request = shipment.getBloodRequest();
        request.setStatus(BloodRequestStatus.FULFILLED);
        bloodRequestRepository.save(request);

        Shipment saved = shipmentRepository.save(shipment);
        auditService.log(staff.getId(), staff.getRole().name(), AuditAction.DELIVER,
                "Shipment", String.valueOf(saved.getId()),
                "Shipment delivered to " + receivedBy + " for request #" + request.getId());

        log.info("Shipment #{} delivered to {} for request #{}", saved.getId(), receivedBy, request.getId());
        return saved;
    }

    @Transactional(readOnly = true)
    public Shipment getById(Long id) {
        return getShipment(id);
    }

    @Transactional(readOnly = true)
    public List<Shipment> getByRequest(Long requestId) {
        return shipmentRepository.findByBloodRequestId(requestId);
    }

    private Shipment getShipment(Long id) {
        return shipmentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Shipment not found"));
    }
}

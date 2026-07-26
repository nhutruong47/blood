package com.nhutruong.blood.emergency.application;

import com.nhutruong.blood.audit.application.AuditService;
import com.nhutruong.blood.audit.domain.AuditAction;
import com.nhutruong.blood.bloodrequest.domain.BloodRequest;
import com.nhutruong.blood.bloodrequest.domain.BloodRequestStatus;
import com.nhutruong.blood.bloodrequest.domain.Urgency;
import com.nhutruong.blood.bloodrequest.infrastructure.BloodRequestRepository;
import com.nhutruong.blood.emergency.application.dto.CreateEmergencyRequest;
import com.nhutruong.blood.emergency.application.dto.EmergencyRequestResponse;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.inventory.application.InventoryService;
import com.nhutruong.blood.inventory.application.dto.BloodUnitResponse;
import com.nhutruong.blood.inventory.application.dto.ReserveBloodUnitsRequest;
import com.nhutruong.blood.matching.application.DonorMatchingService;
import com.nhutruong.blood.matching.domain.DonorMatchRecommendation;
import com.nhutruong.blood.notification.application.NotificationService;
import com.nhutruong.blood.bloodrequest.application.dto.BloodRequestResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmergencyRequestService {
    private final BloodRequestRepository bloodRequestRepository;
    private final InventoryService inventoryService;
    private final DonorMatchingService donorMatchingService;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public EmergencyRequestService(
            BloodRequestRepository bloodRequestRepository,
            InventoryService inventoryService,
            DonorMatchingService donorMatchingService,
            NotificationService notificationService,
            AuditService auditService
    ) {
        this.bloodRequestRepository = bloodRequestRepository;
        this.inventoryService = inventoryService;
        this.donorMatchingService = donorMatchingService;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    @Transactional
    public EmergencyRequestResponse create(CreateEmergencyRequest request, User hospital) {
        BloodRequest bloodRequest = new BloodRequest();
        bloodRequest.setBloodGroup(request.bloodGroup());
        bloodRequest.setUrgency(Urgency.EMERGENCY);
        bloodRequest.setRecipientInfo(request.recipientInfo().trim());
        bloodRequest.setComponentType(request.componentType());
        bloodRequest.setQuantityUnits(request.quantityUnits());
        bloodRequest.setLatitude(request.latitude());
        bloodRequest.setLongitude(request.longitude());
        bloodRequest.setMedicalCenter(hospital);
        bloodRequest.setStatus(BloodRequestStatus.TRIAGED);
        BloodRequest saved = bloodRequestRepository.save(bloodRequest);

        ReserveBloodUnitsRequest reservation = new ReserveBloodUnitsRequest(
                saved.getId(),
                saved.getBloodGroup(),
                saved.getComponentType(),
                saved.getQuantityUnits()
        );

        if (inventoryService.canReserve(reservation)) {
            List<BloodUnitResponse> reserved = inventoryService
                    .reserve(reservation)
                    .stream()
                    .map(BloodUnitResponse::from)
                    .toList();
            saved.setStatus(BloodRequestStatus.RESERVED);
            saved = bloodRequestRepository.save(saved);
            auditService.record(hospital, AuditAction.EMERGENCY_ALERT, "BloodRequest", saved.getId(), "Emergency request reserved from inventory");
            return new EmergencyRequestResponse(BloodRequestResponse.from(saved), saved.getStatus(), reserved.size(), 0, 0);
        }

        saved.setStatus(BloodRequestStatus.MATCHING_DONOR);
        saved = bloodRequestRepository.save(saved);
        List<DonorMatchRecommendation> recommendations = donorMatchingService.recommend(saved, 20);
        int notificationsQueued = notificationService
                .emergencyAlert(recommendations.stream().map(DonorMatchRecommendation::getDonor).toList(), saved.getId(), saved.getBloodGroup().name())
                .size();
        auditService.record(hospital, AuditAction.EMERGENCY_ALERT, "BloodRequest", saved.getId(), "Emergency donor matching started");
        return new EmergencyRequestResponse(BloodRequestResponse.from(saved), saved.getStatus(), 0, recommendations.size(), notificationsQueued);
    }
}

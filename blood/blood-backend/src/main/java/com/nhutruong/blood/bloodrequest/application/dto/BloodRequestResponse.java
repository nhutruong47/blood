package com.nhutruong.blood.bloodrequest.application.dto;

import com.nhutruong.blood.bloodrequest.domain.BloodRequest;
import com.nhutruong.blood.bloodrequest.domain.BloodRequestStatus;
import com.nhutruong.blood.bloodrequest.domain.Urgency;
import com.nhutruong.blood.inventory.domain.BloodComponentType;
import com.nhutruong.blood.shared.domain.BloodGroup;

import java.time.LocalDateTime;

public record BloodRequestResponse(
        Long id,
        BloodGroup bloodGroup,
        Urgency urgency,
        String recipientInfo,
        BloodComponentType componentType,
        Integer quantityUnits,
        Double latitude,
        Double longitude,
        Long medicalCenterId,
        BloodRequestStatus status,
        String staffResponse,
        Long approvedById,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static BloodRequestResponse from(BloodRequest request) {
        return new BloodRequestResponse(
                request.getId(),
                request.getBloodGroup(),
                request.getUrgency(),
                request.getRecipientInfo(),
                request.getComponentType(),
                request.getQuantityUnits(),
                request.getLatitude(),
                request.getLongitude(),
                request.getMedicalCenter().getId(),
                request.getStatus(),
                request.getStaffResponse(),
                request.getApprovedBy() == null ? null : request.getApprovedBy().getId(),
                request.getCreatedAt(),
                request.getUpdatedAt()
        );
    }
}

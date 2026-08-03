package com.nhutruong.blood.dto;

import com.nhutruong.blood.entity.BloodRequest;
import com.nhutruong.blood.enums.BloodRequestStatus;
import com.nhutruong.blood.enums.UrgencyLevel;

import java.time.LocalDateTime;

public record BloodRequestResponse(
        Long id,
        String bloodGroup,
        UrgencyLevel urgency,
        int amount,
        String recipientInfo,
        BloodRequestStatus status,
        Long medicalCenterId,
        Long processedBy,
        LocalDateTime processedAt,
        String staffResponse,
        String rejectionReason,
        LocalDateTime fulfilledAt,
        LocalDateTime cancelledAt,
        String fulfilledBloodGroup
) {
    public static BloodRequestResponse from(BloodRequest request) {
        return new BloodRequestResponse(
                request.getId(),
                request.getBloodGroup(),
                request.getUrgency(),
                request.getAmount(),
                request.getRecipientInfo(),
                request.getStatus(),
                request.getMedicalCenter() == null ? null : request.getMedicalCenter().getId(),
                request.getProcessedBy() == null ? null : request.getProcessedBy().getId(),
                request.getProcessedAt(),
                request.getStaffResponse(),
                request.getRejectionReason(),
                request.getFulfilledAt(),
                request.getCancelledAt(),
                request.getFulfilledBloodGroup()
        );
    }
}

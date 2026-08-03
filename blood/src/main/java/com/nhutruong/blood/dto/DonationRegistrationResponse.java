package com.nhutruong.blood.dto;

import com.nhutruong.blood.entity.DonationRegistration;
import com.nhutruong.blood.enums.DonationRegistrationStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record DonationRegistrationResponse(
        Long id,
        String medicalCenter,
        LocalDate donationDate,
        String bloodGroup,
        String healthStatus,
        double weight,
        int amount,
        int age,
        DonationRegistrationStatus status,
        Long donorId,
        Long approvedBy,
        LocalDateTime approvedAt,
        Long rejectedBy,
        LocalDateTime rejectedAt,
        Long completedBy,
        LocalDateTime completedAt,
        String decisionReason
) {
    public static DonationRegistrationResponse from(DonationRegistration registration) {
        return new DonationRegistrationResponse(
                registration.getId(),
                registration.getMedicalCenter(),
                registration.getDonationDate(),
                registration.getBloodGroup(),
                registration.getHealthStatus(),
                registration.getWeight(),
                registration.getAmount(),
                registration.getAge(),
                registration.getStatus(),
                registration.getDonor() == null ? null : registration.getDonor().getId(),
                registration.getApprovedBy() == null ? null : registration.getApprovedBy().getId(),
                registration.getApprovedAt(),
                registration.getRejectedBy() == null ? null : registration.getRejectedBy().getId(),
                registration.getRejectedAt(),
                registration.getCompletedBy() == null ? null : registration.getCompletedBy().getId(),
                registration.getCompletedAt(),
                registration.getDecisionReason()
        );
    }
}

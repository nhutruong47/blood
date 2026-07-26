package com.nhutruong.blood.donation.application.dto;

import com.nhutruong.blood.donation.domain.DonationRegistration;
import com.nhutruong.blood.donation.domain.DonationRegistrationStatus;
import com.nhutruong.blood.shared.domain.BloodGroup;

import java.time.LocalDate;

public record DonationRegistrationResponse(
        Long id,
        String medicalCenterName,
        LocalDate donationDate,
        BloodGroup bloodGroup,
        String healthStatus,
        double weight,
        int amount,
        int age,
        DonationRegistrationStatus status
) {
    public static DonationRegistrationResponse from(DonationRegistration registration) {
        return new DonationRegistrationResponse(
                registration.getId(),
                registration.getMedicalCenterName(),
                registration.getDonationDate(),
                registration.getBloodGroup(),
                registration.getHealthStatus(),
                registration.getWeight(),
                registration.getAmount(),
                registration.getAge(),
                registration.getStatus()
        );
    }
}

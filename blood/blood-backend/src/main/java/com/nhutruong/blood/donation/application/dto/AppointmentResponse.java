package com.nhutruong.blood.donation.application.dto;

import com.nhutruong.blood.donation.domain.DonationRegistration;

import java.time.LocalDateTime;

public record AppointmentResponse(
        Long id,
        String donorName,
        String bloodGroup,
        LocalDateTime appointmentDate,
        String locationName,
        String status,
        String medicalCenterName
) {
    public static AppointmentResponse from(DonationRegistration registration) {
        String donorName = registration.getDonor() == null
                ? null
                : registration.getDonor().getFirstName() + " " + registration.getDonor().getLastName();
        return new AppointmentResponse(
                registration.getId(),
                donorName,
                registration.getBloodGroup() != null ? registration.getBloodGroup().name() : null,
                registration.getDonationDate() != null ? registration.getDonationDate().atStartOfDay() : null,
                registration.getMedicalCenterName(),
                registration.getStatus() != null ? registration.getStatus().name() : null,
                registration.getMedicalCenterName()
        );
    }
}

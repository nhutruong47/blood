package com.nhutruong.blood.donation.application.dto;

import com.nhutruong.blood.donation.domain.DonationRegistration;

import java.time.LocalDateTime;

public class AppointmentResponse {
    private final Long id;
    private final String donorName;
    private final String bloodGroup;
    private final LocalDateTime appointmentDate;
    private final String locationName;
    private final String status;
    private final String medicalCenterName;

    public AppointmentResponse(Long id, String donorName, String bloodGroup,
                               LocalDateTime appointmentDate, String locationName,
                               String status, String medicalCenterName) {
        this.id = id;
        this.donorName = donorName;
        this.bloodGroup = bloodGroup;
        this.appointmentDate = appointmentDate;
        this.locationName = locationName;
        this.status = status;
        this.medicalCenterName = medicalCenterName;
    }

    public static AppointmentResponse from(DonationRegistration registration) {
        return from(registration, null);
    }

    public static AppointmentResponse from(DonationRegistration registration, String centerName) {
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

    public Long getId() {
        return id;
    }

    public String getDonorName() {
        return donorName;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public LocalDateTime getAppointmentDate() {
        return appointmentDate;
    }

    public String getLocationName() {
        return locationName;
    }

    public String getStatus() {
        return status;
    }

    public String getMedicalCenterName() {
        return medicalCenterName;
    }
}

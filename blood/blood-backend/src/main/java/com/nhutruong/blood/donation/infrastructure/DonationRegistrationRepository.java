package com.nhutruong.blood.donation.infrastructure;

import com.nhutruong.blood.donation.domain.DonationRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Collection;

public interface DonationRegistrationRepository extends JpaRepository<DonationRegistration, Long> {
    long countByDonationDateAndMedicalCenterNameAndStatusNotIn(
            LocalDate donationDate,
            String medicalCenterName,
            Collection<com.nhutruong.blood.donation.domain.DonationRegistrationStatus> statuses
    );
}

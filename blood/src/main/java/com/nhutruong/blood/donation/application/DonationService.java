package com.nhutruong.blood.donation.application;

import com.nhutruong.blood.donation.application.dto.RegisterDonationRequest;
import com.nhutruong.blood.donation.domain.DonationRegistration;
import com.nhutruong.blood.donation.infrastructure.DonationRegistrationRepository;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.shared.exception.BusinessException;
import com.nhutruong.blood.shared.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DonationService {
    private final DonationRegistrationRepository donationRegistrationRepository;

    public DonationService(DonationRegistrationRepository donationRegistrationRepository) {
        this.donationRegistrationRepository = donationRegistrationRepository;
    }

    @Transactional
    public DonationRegistration registerDonation(RegisterDonationRequest request, User donor) {
        if (request.age() < 18) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Donor must be at least 18 years old");
        }
        if (request.weight() < 45) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Donor weight must be at least 45 kg");
        }

        DonationRegistration registration = new DonationRegistration();
        registration.setMedicalCenterName(request.medicalCenterName().trim());
        registration.setDonationDate(request.donationDate());
        registration.setBloodGroup(request.bloodGroup());
        registration.setHealthStatus(request.healthStatus().trim());
        registration.setWeight(request.weight());
        registration.setAmount(request.amount());
        registration.setAge(request.age());
        registration.setDonor(donor);

        return donationRegistrationRepository.save(registration);
    }
}

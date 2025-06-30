package com.nhutruong.blood.service;

import com.nhutruong.blood.entity.DonationRegistration;
import com.nhutruong.blood.repository.DonationRegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DonationService {

    @Autowired
    private DonationRegistrationRepository donationRepo;

    public void registerDonation(DonationRegistration registration) {
        donationRepo.save(registration);
    }
}

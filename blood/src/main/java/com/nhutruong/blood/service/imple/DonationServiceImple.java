package com.nhutruong.blood.service.imple;

import com.nhutruong.blood.entity.DonationRegistration;
import com.nhutruong.blood.repository.DonationRegistrationRepository;
import com.nhutruong.blood.service.DonationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DonationServiceImple implements DonationService {

    @Autowired
    private DonationRegistrationRepository donationRepo;

    @Override
    public void registerDonation(DonationRegistration registration) {
        donationRepo.save(registration);
    }
}

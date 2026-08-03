package com.nhutruong.blood.service;

import com.nhutruong.blood.dto.DonationDecisionRequest;
import com.nhutruong.blood.dto.DonationRegistrationRequest;
import com.nhutruong.blood.entity.DonationRegistration;
import com.nhutruong.blood.entity.User;

import java.util.List;

public interface DonationService {
    DonationRegistration registerDonation(DonationRegistrationRequest request, User donor);
    List<DonationRegistration> myRegistrations(User donor);
    DonationRegistration myRegistration(Long id, User donor);
    List<DonationRegistration> staffDonations();
    DonationRegistration approve(Long id, DonationDecisionRequest request, User staff);
    DonationRegistration reject(Long id, DonationDecisionRequest request, User staff);
    DonationRegistration complete(Long id, DonationDecisionRequest request, User staff);
}

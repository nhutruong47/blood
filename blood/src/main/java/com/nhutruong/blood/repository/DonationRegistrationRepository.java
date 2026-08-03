package com.nhutruong.blood.repository;

import com.nhutruong.blood.entity.DonationRegistration;
import com.nhutruong.blood.entity.User;
import com.nhutruong.blood.enums.DonationRegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DonationRegistrationRepository extends JpaRepository<DonationRegistration, Long> {
    List<DonationRegistration> findByDonor(User donor);
    List<DonationRegistration> findByStatus(DonationRegistrationStatus status);
}

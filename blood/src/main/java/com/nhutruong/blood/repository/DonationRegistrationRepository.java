package com.nhutruong.blood.repository;

import com.nhutruong.blood.entity.DonationRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DonationRegistrationRepository extends JpaRepository<DonationRegistration, Long> {
}

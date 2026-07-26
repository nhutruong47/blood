package com.nhutruong.blood.donation.infrastructure;

import com.nhutruong.blood.donation.domain.DonationRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DonationRegistrationRepository extends JpaRepository<DonationRegistration, Long> {
}

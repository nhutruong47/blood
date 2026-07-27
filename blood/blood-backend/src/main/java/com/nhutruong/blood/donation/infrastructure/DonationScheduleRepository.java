package com.nhutruong.blood.donation.infrastructure;

import com.nhutruong.blood.donation.domain.DonationSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DonationScheduleRepository extends JpaRepository<DonationSchedule, Long> {
}

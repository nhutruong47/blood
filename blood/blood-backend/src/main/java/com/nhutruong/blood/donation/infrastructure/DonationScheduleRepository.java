package com.nhutruong.blood.donation.infrastructure;

import com.nhutruong.blood.donation.domain.DonationRegistration;
import com.nhutruong.blood.donation.domain.DonationSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface DonationScheduleRepository extends JpaRepository<DonationSchedule, Long> {
    @Query("SELECT COUNT(r) FROM DonationRegistration r WHERE r.donationDate = :date "
            + "AND r.medicalCenterName = :centerName "
            + "AND r.status NOT IN ('CANCELLED', 'DEFERRED')")
    long countActiveRegistrationsForDate(
            @Param("date") LocalDate date,
            @Param("centerName") String centerName
    );
}

package com.nhutruong.blood.donation.infrastructure;

import com.nhutruong.blood.donation.domain.DonationRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface DonationRegistrationRepository extends JpaRepository<DonationRegistration, Long> {
    long countByDonationDateAndMedicalCenterNameAndStatusNotIn(
            LocalDate donationDate,
            String medicalCenterName,
            Collection<com.nhutruong.blood.donation.domain.DonationRegistrationStatus> statuses
    );

    /**
     * Group donations by (year, month) for the analytics dashboard.
     * The result is a small list (≤ 12 rows) instead of streaming the whole
     * table.
     */
    @Query("""
        SELECT YEAR(r.donationDate), MONTH(r.donationDate), COUNT(r)
        FROM DonationRegistration r
        WHERE r.donationDate >= :cutoff
        GROUP BY YEAR(r.donationDate), MONTH(r.donationDate)
        ORDER BY YEAR(r.donationDate), MONTH(r.donationDate)
    """)
    List<Object[]> donationsByMonthSince(@Param("cutoff") LocalDate cutoff);

    /**
     * Top N donation centers by registration count. Pushed down to the DB
     * via GROUP BY + ORDER BY + LIMIT (derived from {@code Pageable.ofSize}).
     */
    @Query("""
        SELECT r.medicalCenterName, COUNT(r)
        FROM DonationRegistration r
        WHERE r.medicalCenterName IS NOT NULL AND r.medicalCenterName <> ''
        GROUP BY r.medicalCenterName
        ORDER BY COUNT(r) DESC
    """)
    List<Object[]> topCentersByRegistrationsRaw(org.springframework.data.domain.Pageable pageable);

    /** Materialise the raw rows so the controller doesn't need a cast. */
    default List<Object[]> topCentersByRegistrations(int limit) {
        return topCentersByRegistrationsRaw(org.springframework.data.domain.PageRequest.of(0, limit));
    }
}

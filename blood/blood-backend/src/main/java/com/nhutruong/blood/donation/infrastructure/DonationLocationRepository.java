package com.nhutruong.blood.donation.infrastructure;

import com.nhutruong.blood.donation.domain.DonationLocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DonationLocationRepository extends JpaRepository<DonationLocation, Long> {
    Optional<DonationLocation> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<DonationLocation> findByPublishedTrue();
}

package com.nhutruong.blood.donation.infrastructure;

import com.nhutruong.blood.donation.domain.DonationLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DonationLocationRepository extends JpaRepository<DonationLocation, Long> {
    Optional<DonationLocation> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<DonationLocation> findByPublishedTrue();

    /**
     * Bounding-box pre-filter for the {@code /nearby} endpoint. The DB
     * returns only rows whose lat/lng fall inside the rectangle, then the
     * service computes the exact great-circle distance on the small result
     * set. SQL Server uses {@code idx_donation_location_geo}.
     *
     * <p>The bounding box is generous: 1° latitude ≈ 111 km so the multiplier
     * is the radius in km divided by 111, with a small slack for the bounding
     * box itself.
     */
    @Query("""
        SELECT l FROM DonationLocation l
        WHERE l.published = true
          AND l.latitude  IS NOT NULL AND l.longitude IS NOT NULL
          AND l.latitude  BETWEEN :minLat AND :maxLat
          AND l.longitude BETWEEN :minLng AND :maxLng
    """)
    List<DonationLocation> findPublishedInBoundingBox(
            @Param("minLat") double minLat,
            @Param("maxLat") double maxLat,
            @Param("minLng") double minLng,
            @Param("maxLng") double maxLng
    );
}

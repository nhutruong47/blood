package com.nhutruong.blood.donation.application;

import com.nhutruong.blood.donation.application.dto.AddDonationScheduleRequest;
import com.nhutruong.blood.donation.application.dto.CreateDonationLocationRequest;
import com.nhutruong.blood.donation.application.dto.DonationLocationResponse;
import com.nhutruong.blood.donation.application.dto.NearbyDonationLocationResponse;
import com.nhutruong.blood.donation.domain.DonationLocation;
import com.nhutruong.blood.donation.domain.DonationSchedule;
import com.nhutruong.blood.donation.infrastructure.DonationLocationRepository;
import com.nhutruong.blood.donation.infrastructure.DonationScheduleRepository;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.shared.exception.BusinessException;
import com.nhutruong.blood.shared.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
public class DonationLocationService {
    private static final double EARTH_RADIUS_KM = 6371.0;

    private final DonationLocationRepository locationRepository;
    private final DonationScheduleRepository scheduleRepository;

    public DonationLocationService(
            DonationLocationRepository locationRepository,
            DonationScheduleRepository scheduleRepository
    ) {
        this.locationRepository = locationRepository;
        this.scheduleRepository = scheduleRepository;
    }

    @Transactional
    public DonationLocation createLocation(CreateDonationLocationRequest request, User medicalCenter) {
        DonationLocation location = new DonationLocation();
        location.setName(request.name().trim());
        location.setAddress(request.address().trim());
        location.setLatitude(request.latitude());
        location.setLongitude(request.longitude());
        location.setCreatedBy(medicalCenter);
        location.setPublished(request.published() == null || request.published());

        String slug = uniqueSlug(request.slug() == null || request.slug().isBlank() ? request.name() : request.slug());
        location.setSlug(slug);
        location.setSeoTitle(defaultIfBlank(request.seoTitle(), request.name() + " blood donation location"));
        location.setSeoDescription(defaultIfBlank(
                request.seoDescription(),
                "Blood donation location at " + request.address()
        ));

        return locationRepository.save(location);
    }

    @Transactional
    public DonationSchedule addSchedule(Long locationId, AddDonationScheduleRequest request) {
        DonationLocation location = locationRepository.findById(locationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Donation location not found"));

        DonationSchedule schedule = new DonationSchedule();
        schedule.setLocation(location);
        schedule.setDonationTime(request.donationTime());
        schedule.setCapacity(request.capacity());

        return scheduleRepository.save(schedule);
    }

    @Transactional(readOnly = true)
    public List<DonationLocationResponse> publishedLocations() {
        return locationRepository.findByPublishedTrue().stream()
                .map(DonationLocationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NearbyDonationLocationResponse> nearby(double latitude, double longitude, double radiusKm) {
        return locationRepository.findByPublishedTrue().stream()
                .filter(location -> location.getLatitude() != null && location.getLongitude() != null)
                .map(location -> new NearbyDonationLocationResponse(
                        DonationLocationResponse.from(location),
                        roundDistance(distanceKm(latitude, longitude, location.getLatitude(), location.getLongitude()))
                ))
                .filter(result -> result.distanceKm() <= radiusKm)
                .sorted(Comparator.comparingDouble(NearbyDonationLocationResponse::distanceKm))
                .toList();
    }

    @Transactional(readOnly = true)
    public DonationLocation getPublishedBySlug(String slug) {
        DonationLocation location = locationRepository.findBySlug(slug)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Donation location not found"));
        if (!location.isPublished()) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "Donation location not found");
        }
        return location;
    }

    @Transactional(readOnly = true)
    public DonationLocationResponse publicLocationBySlug(String slug) {
        return DonationLocationResponse.from(getPublishedBySlug(slug));
    }

    private String uniqueSlug(String value) {
        String base = slugify(value);
        String candidate = base;
        int counter = 2;
        while (locationRepository.existsBySlug(candidate)) {
            candidate = base + "-" + counter++;
        }
        return candidate;
    }

    private String slugify(String value) {
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        return normalized.isBlank() ? "donation-location" : normalized;
    }

    private String defaultIfBlank(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private double distanceKm(double lat1, double lng1, double lat2, double lng2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    private double roundDistance(double distance) {
        return Math.round(distance * 100.0) / 100.0;
    }
}

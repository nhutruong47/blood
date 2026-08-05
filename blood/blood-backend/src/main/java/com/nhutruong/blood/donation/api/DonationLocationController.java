package com.nhutruong.blood.donation.api;

import com.nhutruong.blood.donation.application.DonationLocationService;
import com.nhutruong.blood.donation.application.dto.*;
import com.nhutruong.blood.donation.domain.DonationLocation;
import com.nhutruong.blood.donation.domain.DonationSchedule;
import com.nhutruong.blood.identity.domain.Role;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.shared.api.ApiResponse;
import com.nhutruong.blood.shared.security.SessionUser;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Positive;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RestController
public class DonationLocationController {
    private final DonationLocationService locationService;

    public DonationLocationController(DonationLocationService locationService) {
        this.locationService = locationService;
    }

    @PostMapping("/api/medicalcenter/locations")
    public ApiResponse<DonationLocationResponse> createLocation(
            @Valid @RequestBody CreateDonationLocationRequest request,
            HttpSession session
    ) {
        User medicalCenter = SessionUser.requireRole(session, Role.MEDICALCENTER);
        DonationLocation location = locationService.createLocation(request, medicalCenter);
        return ApiResponse.success("Donation location created", DonationLocationResponse.from(location));
    }

    @PostMapping("/api/medicalcenter/locations/{id}/schedules")
    @PreAuthorize("hasAnyRole('MEDICALCENTER', 'STAFF', 'ADMIN')")
    public ApiResponse<DonationScheduleResponse> addSchedule(
            @PathVariable Long id,
            @Valid @RequestBody AddDonationScheduleRequest request
    ) {
        DonationSchedule schedule = locationService.addSchedule(id, request);
        return ApiResponse.success("Donation schedule created", DonationScheduleResponse.from(schedule));
    }

    @GetMapping("/api/public/locations")
    public ApiResponse<List<DonationLocationResponse>> publicLocations() {
        return ApiResponse.success(locationService.publishedLocations());
    }

    @GetMapping("/api/public/locations/{slug}")
    public ApiResponse<DonationLocationResponse> publicLocationBySlug(@PathVariable String slug) {
        return ApiResponse.success(locationService.publicLocationBySlug(slug));
    }

    @GetMapping("/api/public/locations/nearby")
    public ApiResponse<List<NearbyDonationLocationResponse>> nearbyLocations(
            @RequestParam @DecimalMin("-90.0") @DecimalMax("90.0") double lat,
            @RequestParam @DecimalMin("-180.0") @DecimalMax("180.0") double lng,
            @RequestParam(defaultValue = "25") @Positive double radiusKm
    ) {
        return ApiResponse.success(locationService.nearby(lat, lng, radiusKm));
    }
}

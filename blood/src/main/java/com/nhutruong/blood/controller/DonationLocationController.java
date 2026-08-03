package com.nhutruong.blood.controller;

import com.nhutruong.blood.dto.ApiResponse;
import com.nhutruong.blood.dto.DonationLocationRequest;
import com.nhutruong.blood.dto.DonationLocationResponse;
import com.nhutruong.blood.dto.DonationScheduleRequest;
import com.nhutruong.blood.dto.DonationScheduleResponse;
import com.nhutruong.blood.entity.Role;
import com.nhutruong.blood.entity.User;
import com.nhutruong.blood.service.CurrentUserService;
import com.nhutruong.blood.service.DonationLocationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DonationLocationController {

    private final DonationLocationService locationService;
    private final CurrentUserService currentUserService;

    public DonationLocationController(DonationLocationService locationService, CurrentUserService currentUserService) {
        this.locationService = locationService;
        this.currentUserService = currentUserService;
    }

    @PreAuthorize("hasRole('MEDICALCENTER')")
    @PostMapping("/api/medicalcenter/locations")
    public ResponseEntity<ApiResponse<DonationLocationResponse>> createLocation(
            @Valid @RequestBody DonationLocationRequest request
    ) {
        User currentUser = currentUserService.requireRole(Role.MEDICALCENTER);
        var location = locationService.create(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Donation location created", DonationLocationResponse.from(location)));
    }

    @PreAuthorize("hasRole('MEDICALCENTER')")
    @PostMapping("/api/medicalcenter/locations/{id}/schedules")
    public ResponseEntity<ApiResponse<DonationScheduleResponse>> addSchedule(
            @PathVariable Long id,
            @Valid @RequestBody DonationScheduleRequest request
    ) {
        User currentUser = currentUserService.requireRole(Role.MEDICALCENTER);
        var schedule = locationService.addSchedule(id, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Donation schedule created", DonationScheduleResponse.from(schedule)));
    }
}

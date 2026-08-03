package com.nhutruong.blood.controller;

import com.nhutruong.blood.dto.ApiResponse;
import com.nhutruong.blood.dto.DonationRegistrationRequest;
import com.nhutruong.blood.dto.DonationRegistrationResponse;
import com.nhutruong.blood.entity.Role;
import com.nhutruong.blood.entity.User;
import com.nhutruong.blood.service.CurrentUserService;
import com.nhutruong.blood.service.imple.DonationServiceImple;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class DonationController {

    private final DonationServiceImple donationService;
    private final CurrentUserService currentUserService;

    public DonationController(DonationServiceImple donationService, CurrentUserService currentUserService) {
        this.donationService = donationService;
        this.currentUserService = currentUserService;
    }

    @PreAuthorize("hasRole('DONOR')")
    @PostMapping("/api/donate/register")
    public ResponseEntity<ApiResponse<DonationRegistrationResponse>> registerDonation(
            @Valid @RequestBody DonationRegistrationRequest request
    ) {
        User donor = currentUserService.requireRole(Role.DONOR);
        var registration = donationService.registerDonation(request, donor);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Donation registration created", DonationRegistrationResponse.from(registration)));
    }

    @PreAuthorize("hasRole('DONOR')")
    @GetMapping("/api/donate/my-registrations")
    public ApiResponse<List<DonationRegistrationResponse>> myRegistrations() {
        User donor = currentUserService.requireRole(Role.DONOR);
        List<DonationRegistrationResponse> data = donationService.myRegistrations(donor)
                .stream()
                .map(DonationRegistrationResponse::from)
                .toList();
        return ApiResponse.ok("Donation registrations", data);
    }

    @PreAuthorize("hasRole('DONOR')")
    @GetMapping("/api/donate/my-registrations/{id}")
    public ApiResponse<DonationRegistrationResponse> myRegistration(@PathVariable Long id) {
        User donor = currentUserService.requireRole(Role.DONOR);
        return ApiResponse.ok("Donation registration", DonationRegistrationResponse.from(donationService.myRegistration(id, donor)));
    }
}

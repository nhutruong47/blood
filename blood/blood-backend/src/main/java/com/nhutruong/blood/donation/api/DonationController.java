package com.nhutruong.blood.donation.api;

import com.nhutruong.blood.donation.application.DonationService;
import com.nhutruong.blood.donation.application.EligibilityService;
import com.nhutruong.blood.donation.application.dto.AppointmentResponse;
import com.nhutruong.blood.donation.application.dto.CreateAppointmentRequest;
import com.nhutruong.blood.donation.application.dto.DonationRegistrationResponse;
import com.nhutruong.blood.donation.application.dto.EligibilityCheckRequest;
import com.nhutruong.blood.donation.application.dto.EligibilityCheckResponse;
import com.nhutruong.blood.donation.application.dto.RegisterDonationRequest;
import com.nhutruong.blood.donation.domain.DonationRegistration;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.shared.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/donate")
public class DonationController {
    private final DonationService donationService;
    private final EligibilityService eligibilityService;

    public DonationController(DonationService donationService, EligibilityService eligibilityService) {
        this.donationService = donationService;
        this.eligibilityService = eligibilityService;
    }

    @PostMapping("/eligibility-check")
    public ApiResponse<EligibilityCheckResponse> checkEligibility(
            @Valid @RequestBody EligibilityCheckRequest request
    ) {
        return ApiResponse.success("Eligibility checked", eligibilityService.check(request));
    }

    @PostMapping("/appointments")
    @PreAuthorize("hasRole('DONOR')")
    public ApiResponse<AppointmentResponse> createAppointment(
            @Valid @RequestBody CreateAppointmentRequest request,
            @AuthenticationPrincipal User donor
    ) {
        return ApiResponse.success("Appointment booked",
                AppointmentResponse.from(donationService.createAppointment(request, donor)));
    }


    @PostMapping("/register")
    @PreAuthorize("hasRole('DONOR')")
    public ApiResponse<DonationRegistrationResponse> registerDonation(
            @Valid @RequestBody RegisterDonationRequest request,
            @AuthenticationPrincipal User donor
    ) {
        DonationRegistration registration = donationService.registerDonation(request, donor);
        return ApiResponse.success(
                "Donation registration submitted",
                DonationRegistrationResponse.from(registration)
        );
    }

    @GetMapping("/me/summary")
    @PreAuthorize("hasRole('DONOR')")
    public ApiResponse<com.nhutruong.blood.donation.application.dto.DonorSummaryResponse> getDonorSummary(
            @AuthenticationPrincipal User donor
    ) {
        return ApiResponse.success(donationService.getDonorSummary(donor));
    }
}

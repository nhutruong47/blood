package com.nhutruong.blood.donation.api;

import com.nhutruong.blood.donation.application.DonationService;
import com.nhutruong.blood.donation.application.EligibilityService;
import com.nhutruong.blood.donation.application.dto.DonationRegistrationResponse;
import com.nhutruong.blood.donation.application.dto.EligibilityCheckRequest;
import com.nhutruong.blood.donation.application.dto.EligibilityCheckResponse;
import com.nhutruong.blood.donation.application.dto.RegisterDonationRequest;
import com.nhutruong.blood.donation.domain.DonationRegistration;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.shared.api.ApiResponse;
import com.nhutruong.blood.shared.security.SessionUser;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
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

    @PostMapping("/register")
    public ApiResponse<DonationRegistrationResponse> registerDonation(
            @Valid @RequestBody RegisterDonationRequest request,
            HttpSession session
    ) {
        User donor = SessionUser.requireAuthenticated(session);
        DonationRegistration registration = donationService.registerDonation(request, donor);
        return ApiResponse.success(
                "Donation registration submitted",
                DonationRegistrationResponse.from(registration)
        );
    }
}

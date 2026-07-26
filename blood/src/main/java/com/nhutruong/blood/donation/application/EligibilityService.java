package com.nhutruong.blood.donation.application;

import com.nhutruong.blood.donation.application.dto.EligibilityCheckRequest;
import com.nhutruong.blood.donation.application.dto.EligibilityCheckResponse;
import com.nhutruong.blood.donation.domain.EligibilityStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class EligibilityService {
    private static final int MIN_AGE = 18;
    private static final int MAX_AGE = 60;
    private static final double MIN_WEIGHT_KG = 45.0;
    private static final int MIN_DAYS_BETWEEN_DONATIONS = 84;

    public EligibilityCheckResponse check(EligibilityCheckRequest request) {
        List<String> deferralReasons = new ArrayList<>();
        List<String> reviewReasons = new ArrayList<>();

        if (request.age() < MIN_AGE) {
            deferralReasons.add("Donor must be at least 18 years old.");
        }
        if (request.age() > MAX_AGE) {
            reviewReasons.add("Donors over 60 should be reviewed by medical staff.");
        }
        if (request.weightKg() < MIN_WEIGHT_KG) {
            deferralReasons.add("Donor weight must be at least 45 kg.");
        }
        if (Boolean.FALSE.equals(request.feelingWell())) {
            deferralReasons.add("Donor should feel well on the donation day.");
        }
        if (Boolean.TRUE.equals(request.hasFeverOrInfection())) {
            deferralReasons.add("Fever or active infection requires temporary deferral.");
        }
        if (Boolean.TRUE.equals(request.takingAntibiotics())) {
            reviewReasons.add("Current antibiotic use needs medical staff review.");
        }
        if (Boolean.TRUE.equals(request.recentlyTattooedOrPierced())) {
            reviewReasons.add("Recent tattoo or piercing may require a waiting period.");
        }
        if (Boolean.TRUE.equals(request.pregnantOrRecentlyPregnant())) {
            deferralReasons.add("Pregnancy or recent pregnancy requires temporary deferral.");
        }
        if (Boolean.TRUE.equals(request.hadRecentSurgery())) {
            reviewReasons.add("Recent surgery needs medical staff review.");
        }
        if (request.lastDonationDate() != null) {
            long days = ChronoUnit.DAYS.between(request.lastDonationDate(), LocalDate.now());
            if (days < MIN_DAYS_BETWEEN_DONATIONS) {
                deferralReasons.add("At least 84 days should pass between whole blood donations.");
            }
        }

        if (!deferralReasons.isEmpty()) {
            return new EligibilityCheckResponse(
                    EligibilityStatus.TEMPORARILY_DEFERRED,
                    false,
                    deferralReasons,
                    "Please review the reasons and try again when the temporary condition is resolved."
            );
        }

        if (!reviewReasons.isEmpty()) {
            return new EligibilityCheckResponse(
                    EligibilityStatus.NEEDS_REVIEW,
                    true,
                    reviewReasons,
                    "You may continue booking, but medical staff will review your answers before donation."
            );
        }

        return new EligibilityCheckResponse(
                EligibilityStatus.ELIGIBLE,
                true,
                List.of("No obvious eligibility issues were found from the submitted answers."),
                "You can continue to choose a donation center and appointment time."
        );
    }
}

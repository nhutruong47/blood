package com.nhutruong.blood.donation.application.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record EligibilityCheckRequest(
        @Min(16) @Max(70) int age,
        @Min(30) @Max(250) double weightKg,
        LocalDate lastDonationDate,
        @NotNull Boolean feelingWell,
        @NotNull Boolean hasFeverOrInfection,
        @NotNull Boolean recentlyTattooedOrPierced,
        @NotNull Boolean pregnantOrRecentlyPregnant,
        @NotNull Boolean takingAntibiotics,
        @NotNull Boolean hadRecentSurgery
) {
}

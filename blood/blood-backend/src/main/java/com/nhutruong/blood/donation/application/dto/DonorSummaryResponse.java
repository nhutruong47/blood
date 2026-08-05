package com.nhutruong.blood.donation.application.dto;

import java.time.LocalDate;
import java.util.List;

public record DonorSummaryResponse(
        long totalDonations,
        long livesSaved,
        LocalDate nextEligibleDate,
        LocalDate lastDonationDate,
        List<ActivityEntryResponse> recentActivities
) {}

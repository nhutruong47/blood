package com.nhutruong.blood.donation.application.dto;

import com.nhutruong.blood.donation.domain.EligibilityStatus;

import java.util.List;

public record EligibilityCheckResponse(
        EligibilityStatus status,
        boolean canProceedToBooking,
        List<String> reasons,
        String nextStep
) {
}

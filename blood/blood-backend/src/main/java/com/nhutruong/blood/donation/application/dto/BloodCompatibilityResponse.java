package com.nhutruong.blood.donation.application.dto;

import com.nhutruong.blood.shared.domain.BloodGroup;

import java.util.List;

public record BloodCompatibilityResponse(
        BloodGroup bloodGroup,
        List<BloodGroup> canDonateTo,
        List<BloodGroup> canReceiveFrom,
        String educationNote
) {
}

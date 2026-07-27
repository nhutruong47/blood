package com.nhutruong.blood.emergency.application.dto;

import com.nhutruong.blood.bloodrequest.application.dto.BloodRequestResponse;
import com.nhutruong.blood.bloodrequest.domain.BloodRequestStatus;

public record EmergencyRequestResponse(
        BloodRequestResponse request,
        BloodRequestStatus status,
        int reservedUnits,
        int recommendedDonors,
        int notificationsQueued
) {
}

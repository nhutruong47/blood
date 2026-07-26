package com.nhutruong.blood.bloodrequest.application.dto;

import com.nhutruong.blood.bloodrequest.domain.BloodRequestStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProcessBloodRequestRequest(
        @NotNull BloodRequestStatus status,
        @Size(max = 500) String response
) {
}

package com.nhutruong.blood.dto;

import jakarta.validation.constraints.Pattern;

public record BloodRequestDecisionRequest(
        String response,
        String rejectionReason,
        @Pattern(regexp = "^(A|B|AB|O)[+-]$") String bloodGroup
) {
}

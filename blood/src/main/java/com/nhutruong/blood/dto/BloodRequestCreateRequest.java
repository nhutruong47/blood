package com.nhutruong.blood.dto;

import com.nhutruong.blood.enums.UrgencyLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public record BloodRequestCreateRequest(
        @NotBlank @Pattern(regexp = "^(A|B|AB|O)[+-]$") String bloodGroup,
        @NotNull UrgencyLevel urgency,
        @NotBlank String recipientInfo,
        @Positive int amount
) {
}

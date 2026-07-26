package com.nhutruong.blood.inventory.application.dto;

import com.nhutruong.blood.inventory.domain.LabTestResult;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RecordLabTestRequest(
        @NotNull LabTestResult result,
        @NotBlank String testType,
        String notes
) {
}

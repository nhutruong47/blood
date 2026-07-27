package com.nhutruong.blood.donation.application.dto;

import jakarta.validation.constraints.NotNull;

public record RecordExaminationRequest(
    @NotNull Long registrationId,
    Double bloodPressureSystolic,
    Double bloodPressureDiastolic,
    Double heartRate,
    Double temperature,
    Double hemoglobinLevel,
    String healthNotes
) {}

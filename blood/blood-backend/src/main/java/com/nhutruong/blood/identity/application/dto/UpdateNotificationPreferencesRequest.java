package com.nhutruong.blood.identity.application.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateNotificationPreferencesRequest(
        @NotNull Boolean email,
        @NotNull Boolean sms,
        @NotNull Boolean push,
        @NotNull Boolean emergencyAlerts,
        @NotNull Boolean donationReminders,
        @NotNull Boolean newsletter
) {}

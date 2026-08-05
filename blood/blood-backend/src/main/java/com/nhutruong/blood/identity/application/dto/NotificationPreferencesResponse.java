package com.nhutruong.blood.identity.application.dto;

import com.nhutruong.blood.identity.domain.UserProfile;

public record NotificationPreferencesResponse(
        boolean email,
        boolean sms,
        boolean push,
        boolean emergencyAlerts,
        boolean donationReminders,
        boolean newsletter
) {
    public static NotificationPreferencesResponse from(UserProfile profile) {
        if (profile == null) {
            return new NotificationPreferencesResponse(true, true, true, true, true, false);
        }
        return new NotificationPreferencesResponse(
                profile.isEmailNotifications(),
                profile.isSmsNotifications(),
                profile.isPushNotifications(),
                profile.isEmergencyAlertOptIn(),
                profile.isDonationReminders(),
                profile.isNewsletter()
        );
    }
}

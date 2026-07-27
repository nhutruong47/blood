package com.nhutruong.blood.identity.application.dto;

import com.nhutruong.blood.identity.domain.Gender;
import com.nhutruong.blood.identity.domain.UserProfile;

import java.time.LocalDate;

public record UserProfileResponse(
        String phone,
        LocalDate birthDate,
        Gender gender,
        String address,
        Double latitude,
        Double longitude,
        boolean emergencyAlertOptIn,
        LocalDate lastDonationDate,
        LocalDate nextEligibleDate
) {
    public static UserProfileResponse from(UserProfile profile) {
        if (profile == null) {
            return null;
        }
        return new UserProfileResponse(
                profile.getPhone(),
                profile.getBirthDate(),
                profile.getGender(),
                profile.getAddress(),
                profile.getLatitude(),
                profile.getLongitude(),
                profile.isEmergencyAlertOptIn(),
                profile.getLastDonationDate(),
                profile.getNextEligibleDate()
        );
    }
}

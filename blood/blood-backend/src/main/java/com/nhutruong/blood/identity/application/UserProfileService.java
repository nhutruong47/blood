package com.nhutruong.blood.identity.application;

import com.nhutruong.blood.identity.application.dto.UpdateUserProfileRequest;
import com.nhutruong.blood.identity.domain.Gender;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.identity.domain.UserProfile;
import com.nhutruong.blood.identity.infrastructure.UserProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserProfileService {
    private final UserProfileRepository profileRepository;

    public UserProfileService(UserProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @Transactional
    public UserProfile createDefaultProfile(User user) {
        UserProfile profile = new UserProfile();
        profile.setUser(user);
        profile.setGender(Gender.UNSPECIFIED);
        return profileRepository.save(profile);
    }

    @Transactional(readOnly = true)
    public UserProfile getProfile(User user) {
        return profileRepository.findByUserId(user.getId()).orElse(null);
    }

    @Transactional
    public UserProfile updateProfile(User user, UpdateUserProfileRequest request) {
        UserProfile profile = profileRepository.findByUserId(user.getId()).orElseGet(() -> {
            UserProfile created = new UserProfile();
            created.setUser(user);
            return created;
        });

        profile.setPhone(blankToNull(request.phone()));
        profile.setBirthDate(request.birthDate());
        profile.setGender(request.gender() == null ? Gender.UNSPECIFIED : request.gender());
        profile.setAddress(blankToNull(request.address()));
        profile.setLatitude(request.latitude());
        profile.setLongitude(request.longitude());
        profile.setEmergencyAlertOptIn(Boolean.TRUE.equals(request.emergencyAlertOptIn()));

        return profileRepository.save(profile);
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}

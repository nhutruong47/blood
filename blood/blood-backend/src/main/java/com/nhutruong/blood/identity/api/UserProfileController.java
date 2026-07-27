package com.nhutruong.blood.identity.api;

import com.nhutruong.blood.identity.application.UserProfileService;
import com.nhutruong.blood.identity.application.dto.UpdateUserProfileRequest;
import com.nhutruong.blood.identity.application.dto.UserProfileResponse;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.shared.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class UserProfileController {
    private final UserProfileService profileService;

    public UserProfileController(UserProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ApiResponse<UserProfileResponse> getProfile(@AuthenticationPrincipal User user) {
        return ApiResponse.success(UserProfileResponse.from(profileService.getProfile(user)));
    }

    @PutMapping
    public ApiResponse<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateUserProfileRequest request
    ) {
        return ApiResponse.success("Profile updated", UserProfileResponse.from(profileService.updateProfile(user, request)));
    }
}

package com.nhutruong.blood.identity.application.dto;

import com.nhutruong.blood.identity.domain.Role;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.identity.domain.UserStatus;
import com.nhutruong.blood.shared.domain.BloodGroup;

public record CurrentUserResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        BloodGroup bloodGroup,
        Role role,
        UserStatus status
) {
    public static CurrentUserResponse from(User user) {
        return new CurrentUserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getBloodGroup(),
                user.getRole(),
                user.getStatus()
        );
    }
}

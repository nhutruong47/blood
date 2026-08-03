package com.nhutruong.blood.dto;

import com.nhutruong.blood.entity.Role;
import com.nhutruong.blood.entity.User;
import com.nhutruong.blood.enums.UserStatus;

public record UserResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        String bloodGroup,
        Role role,
        UserStatus status
) {
    public static UserResponse from(User user) {
        return new UserResponse(
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

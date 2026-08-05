package com.nhutruong.blood.identity.application.dto;

import com.nhutruong.blood.identity.domain.Role;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.identity.domain.UserStatus;
import com.nhutruong.blood.shared.domain.BloodGroup;

public class CurrentUserResponse {
    private final Long id;
    private final String email;
    private final String firstName;
    private final String lastName;
    private final BloodGroup bloodGroup;
    private final Role role;
    private final UserStatus status;

    public CurrentUserResponse(Long id, String email, String firstName, String lastName,
                               BloodGroup bloodGroup, Role role, UserStatus status) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.bloodGroup = bloodGroup;
        this.role = role;
        this.status = status;
    }

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

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public BloodGroup getBloodGroup() {
        return bloodGroup;
    }

    public Role getRole() {
        return role;
    }

    public UserStatus getStatus() {
        return status;
    }
}

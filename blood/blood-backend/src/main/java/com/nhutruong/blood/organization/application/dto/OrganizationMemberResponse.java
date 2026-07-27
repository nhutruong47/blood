package com.nhutruong.blood.organization.application.dto;

import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.organization.domain.OrganizationMember;

import java.time.LocalDateTime;

public record OrganizationMemberResponse(
        Long id,
        Long userId,
        String email,
        String firstName,
        String lastName,
        String role,
        boolean active,
        LocalDateTime joinedAt
) {
    public static OrganizationMemberResponse from(OrganizationMember member) {
        User user = member.getUser();
        return new OrganizationMemberResponse(
                member.getId(),
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                member.getRole().name(),
                member.isActive(),
                member.getJoinedAt()
        );
    }
}

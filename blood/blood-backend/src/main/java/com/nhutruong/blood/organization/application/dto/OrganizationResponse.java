package com.nhutruong.blood.organization.application.dto;

import com.nhutruong.blood.organization.domain.Organization;
import com.nhutruong.blood.organization.domain.OrganizationStatus;
import com.nhutruong.blood.organization.domain.OrganizationType;

public record OrganizationResponse(
        Long id,
        String code,
        String name,
        OrganizationType type,
        OrganizationStatus status,
        String licenseNumber,
        String address,
        Double latitude,
        Double longitude
) {
    public static OrganizationResponse from(Organization organization) {
        return new OrganizationResponse(
                organization.getId(),
                organization.getCode(),
                organization.getName(),
                organization.getType(),
                organization.getStatus(),
                organization.getLicenseNumber(),
                organization.getAddress(),
                organization.getLatitude(),
                organization.getLongitude()
        );
    }
}

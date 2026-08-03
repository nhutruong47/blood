package com.nhutruong.blood.dto;

import com.nhutruong.blood.entity.DonationLocation;

public record DonationLocationResponse(Long id, String name, String address, Long createdBy) {
    public static DonationLocationResponse from(DonationLocation location) {
        return new DonationLocationResponse(
                location.getId(),
                location.getName(),
                location.getAddress(),
                location.getCreatedBy() == null ? null : location.getCreatedBy().getId()
        );
    }
}

package com.nhutruong.blood.donation.application.dto;

import com.nhutruong.blood.donation.domain.DonationLocation;

import java.util.List;

public record DonationLocationResponse(
        Long id,
        String name,
        String address,
        Double latitude,
        Double longitude,
        String slug,
        String seoTitle,
        String seoDescription,
        boolean published,
        List<DonationScheduleResponse> schedules
) {
    public static DonationLocationResponse from(DonationLocation location) {
        List<DonationScheduleResponse> schedules = location.getSchedules() == null
                ? List.of()
                : location.getSchedules().stream().map(DonationScheduleResponse::from).toList();

        return new DonationLocationResponse(
                location.getId(),
                location.getName(),
                location.getAddress(),
                location.getLatitude(),
                location.getLongitude(),
                location.getSlug(),
                location.getSeoTitle(),
                location.getSeoDescription(),
                location.isPublished(),
                schedules
        );
    }
}

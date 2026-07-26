package com.nhutruong.blood.donation.application.dto;

public record NearbyDonationLocationResponse(
        DonationLocationResponse location,
        double distanceKm
) {
}

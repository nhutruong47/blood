package com.nhutruong.blood.matching.api;

public record DonorMatchResponse(
        Long donorId,
        String donorName,
        String bloodGroup,
        Integer priorityScore,
        Integer bloodGroupScore,
        Integer availabilityScore,
        Integer healthScore,
        String reason
) {}

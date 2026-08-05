package com.nhutruong.blood.donation.application.dto;

import java.time.LocalDate;

public record ActivityEntryResponse(
        String id,
        String type,
        String title,
        LocalDate date,
        String status
) {}

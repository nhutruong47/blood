package com.nhutruong.blood.donation.application.dto;

import com.nhutruong.blood.donation.domain.DonationSchedule;

import java.time.LocalDateTime;

public record DonationScheduleResponse(
        Long id,
        LocalDateTime donationTime,
        Integer capacity
) {
    public static DonationScheduleResponse from(DonationSchedule schedule) {
        return new DonationScheduleResponse(schedule.getId(), schedule.getDonationTime(), schedule.getCapacity());
    }
}

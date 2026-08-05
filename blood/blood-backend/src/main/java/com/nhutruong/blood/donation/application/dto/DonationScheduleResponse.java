package com.nhutruong.blood.donation.application.dto;

import com.nhutruong.blood.donation.domain.DonationSchedule;

import java.time.LocalDateTime;

public record DonationScheduleResponse(
        Long id,
        LocalDateTime donationTime,
        Integer capacity,
        Long locationId,
        String locationName
) {
    public static DonationScheduleResponse from(DonationSchedule schedule) {
        Long locId = schedule.getLocation() != null ? schedule.getLocation().getId() : null;
        String locName = schedule.getLocation() != null ? schedule.getLocation().getName() : null;
        return new DonationScheduleResponse(schedule.getId(), schedule.getDonationTime(), schedule.getCapacity(), locId, locName);
    }
}

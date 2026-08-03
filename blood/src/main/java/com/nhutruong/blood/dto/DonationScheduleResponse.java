package com.nhutruong.blood.dto;

import com.nhutruong.blood.entity.DonationSchedule;

import java.time.LocalDateTime;

public record DonationScheduleResponse(
        Long id,
        Long locationId,
        LocalDateTime startTime,
        LocalDateTime endTime,
        Integer capacity
) {
    public static DonationScheduleResponse from(DonationSchedule schedule) {
        return new DonationScheduleResponse(
                schedule.getId(),
                schedule.getLocation() == null ? null : schedule.getLocation().getId(),
                schedule.getStartTime(),
                schedule.getEndTime(),
                schedule.getCapacity()
        );
    }
}

package com.nhutruong.blood.donation.api;

import com.nhutruong.blood.donation.application.DonationScheduleService;
import com.nhutruong.blood.donation.application.dto.DonationScheduleResponse;
import com.nhutruong.blood.shared.api.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class DonationScheduleController {
    private final DonationScheduleService scheduleService;

    public DonationScheduleController(DonationScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping
    public ApiResponse<List<DonationScheduleResponse>> getAllSchedules() {
        return ApiResponse.success(scheduleService.getAllSchedules());
    }
}

package com.nhutruong.blood.donation.application;

import com.nhutruong.blood.donation.application.dto.DonationScheduleResponse;
import com.nhutruong.blood.donation.domain.DonationSchedule;
import com.nhutruong.blood.donation.infrastructure.DonationScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DonationScheduleService {
    private final DonationScheduleRepository scheduleRepository;

    public DonationScheduleService(DonationScheduleRepository scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }

    @Transactional(readOnly = true)
    public List<DonationScheduleResponse> getAllSchedules() {
        return scheduleRepository.findAll().stream()
                .map(DonationScheduleResponse::from)
                .collect(Collectors.toList());
    }
}

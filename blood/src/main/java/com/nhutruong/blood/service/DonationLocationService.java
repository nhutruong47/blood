package com.nhutruong.blood.service;

import com.nhutruong.blood.dto.DonationLocationRequest;
import com.nhutruong.blood.dto.DonationScheduleRequest;
import com.nhutruong.blood.entity.DonationLocation;
import com.nhutruong.blood.entity.DonationSchedule;
import com.nhutruong.blood.entity.User;
import com.nhutruong.blood.exception.BusinessRuleException;
import com.nhutruong.blood.exception.ConflictException;
import com.nhutruong.blood.exception.ForbiddenException;
import com.nhutruong.blood.exception.ResourceNotFoundException;
import com.nhutruong.blood.repository.DonationLocationRepository;
import com.nhutruong.blood.repository.DonationScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DonationLocationService {

    private final DonationLocationRepository locationRepository;
    private final DonationScheduleRepository scheduleRepository;

    public DonationLocationService(DonationLocationRepository locationRepository, DonationScheduleRepository scheduleRepository) {
        this.locationRepository = locationRepository;
        this.scheduleRepository = scheduleRepository;
    }

    @Transactional
    public DonationLocation create(DonationLocationRequest request, User medicalCenter) {
        DonationLocation location = new DonationLocation();
        location.setName(request.name());
        location.setAddress(request.address());
        location.setCreatedBy(medicalCenter);
        return locationRepository.save(location);
    }

    @Transactional
    public DonationSchedule addSchedule(Long locationId, DonationScheduleRequest request, User medicalCenter) {
        if (!request.endTime().isAfter(request.startTime())) {
            throw new BusinessRuleException("Schedule endTime must be after startTime");
        }

        DonationLocation location = locationRepository.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation location not found"));

        if (location.getCreatedBy() == null || !location.getCreatedBy().getId().equals(medicalCenter.getId())) {
            throw new ForbiddenException("Cannot manage another medical center location");
        }

        if (scheduleRepository.existsOverlappingSchedule(location, request.startTime(), request.endTime())) {
            throw new ConflictException("Schedule overlaps an existing schedule at this location");
        }

        DonationSchedule schedule = new DonationSchedule();
        schedule.setLocation(location);
        schedule.setDonationTime(request.startTime());
        schedule.setStartTime(request.startTime());
        schedule.setEndTime(request.endTime());
        schedule.setCapacity(request.capacity());
        return scheduleRepository.save(schedule);
    }
}

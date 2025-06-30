package com.nhutruong.blood.controller;

import com.nhutruong.blood.entity.DonationLocation;
import com.nhutruong.blood.entity.DonationSchedule;
import com.nhutruong.blood.entity.User;
import com.nhutruong.blood.repository.DonationLocationRepository;
import com.nhutruong.blood.repository.DonationScheduleRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DonationLocationController {

    @Autowired
    private DonationLocationRepository locationRepo;

    @Autowired
    private DonationScheduleRepository scheduleRepo;

    @PostMapping("/api/medicalcenter/locations")
    public String createLocation(@RequestBody DonationLocation location, HttpSession session) {
        User currentUser = (User) session.getAttribute("currentUser");
        location.setCreatedBy(currentUser);
        locationRepo.save(location);
        return "Tạo địa điểm hiến máu thành công";
    }

    @PostMapping("/api/medicalcenter/locations/{id}/schedules")
    public String addSchedule(@PathVariable Long id, @RequestBody DonationSchedule schedule) {
        DonationLocation location = locationRepo.findById(id).orElse(null);
        if (location == null) return "Không tìm thấy địa điểm";

        schedule.setLocation(location);
        scheduleRepo.save(schedule);
        return "Thêm lịch hiến máu thành công";
    }
}

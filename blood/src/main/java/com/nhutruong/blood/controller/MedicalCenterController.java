package com.nhutruong.blood.controller;

import com.nhutruong.blood.entity.BloodRequest;
import com.nhutruong.blood.entity.Role;
import com.nhutruong.blood.entity.User;
import com.nhutruong.blood.repository.BloodRequestRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class MedicalCenterController {

    @Autowired
    private BloodRequestRepository requestRepo;

    // MedicalCenter gửi yêu cầu mới
    @PostMapping("/api/medicalcenter/request")
    public String createRequest(@RequestBody BloodRequest request, HttpSession session) {
        User currentUser = (User) session.getAttribute("currentUser");
        if (currentUser == null || currentUser.getRole() != Role.MEDICALCENTER) {
            return "Bạn không có quyền gửi yêu cầu";
        }

        request.setMedicalCenter(currentUser);
        request.setStatus("CHỜ DUYỆT");
        requestRepo.save(request);

        return "Đã gửi yêu cầu hiến máu thành công";
    }

    // MedicalCenter xem các yêu cầu đã gửi
    @GetMapping("/api/medicalcenter/my-requests")
    public List<BloodRequest> getMyRequests(HttpSession session) {
        User currentUser = (User) session.getAttribute("currentUser");
        if (currentUser == null || currentUser.getRole() != Role.MEDICALCENTER) {
            return List.of(); // hoặc throw exception
        }

        return requestRepo.findByMedicalCenter(currentUser);
    }
}

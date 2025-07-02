package com.nhutruong.blood.controller;

import com.nhutruong.blood.entity.BloodRequest;
import com.nhutruong.blood.entity.Role;
import com.nhutruong.blood.entity.User;
import com.nhutruong.blood.service.imple.BloodRequestServiceImple;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
public class BloodRequestController {

    @Autowired
    private BloodRequestServiceImple service;

    @PostMapping("/api/request-blood")
    public String requestBlood(@RequestBody BloodRequest request, HttpSession session) {
        User currentUser = (User) session.getAttribute("currentUser");

        if (currentUser == null || currentUser.getRole() != Role.MEDICALCENTER) {
            return "Bạn không có quyền gửi yêu cầu";
        }

        request.setMedicalCenter(currentUser);
        service.createRequest(request);

        return "Đã gửi yêu cầu đến Staff chờ duyệt.";
    }
}

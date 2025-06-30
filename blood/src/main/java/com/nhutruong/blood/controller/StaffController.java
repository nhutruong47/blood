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
public class StaffController {

    @Autowired
    private BloodRequestRepository requestRepo;

    // Lấy danh sách các yêu cầu chờ duyệt
    @GetMapping("/api/staff/requests")
    public List<BloodRequest> getPendingRequests(HttpSession session) {
        User currentUser = (User) session.getAttribute("currentUser");
        if (currentUser == null || currentUser.getRole() != Role.STAFF) {
            return List.of(); // hoặc throw exception
        }
        return requestRepo.findByStatus("CHỜ DUYỆT");
    }

    // Duyệt hoặc từ chối yêu cầu
    @PostMapping("/api/staff/process-request/{id}")
    public String processRequest(
            @PathVariable Long id,
            @RequestParam String status,           // "ĐÃ DUYỆT" hoặc "TỪ CHỐI"
            @RequestParam(required = false) String response,
            HttpSession session) {

        User staff = (User) session.getAttribute("currentUser");
        if (staff == null || staff.getRole() != Role.STAFF) {
            return "Bạn không có quyền xử lý yêu cầu";
        }

        BloodRequest request = requestRepo.findById(id).orElse(null);
        if (request == null) return "Không tìm thấy yêu cầu";

        request.setStatus(status);
        request.setStaffResponse(response);
        request.setApprovedBy(staff);
        requestRepo.save(request);

        return "Đã xử lý yêu cầu thành công";
    }
}

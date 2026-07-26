package com.nhutruong.blood.bloodrequest.api;

import com.nhutruong.blood.bloodrequest.application.BloodRequestService;
import com.nhutruong.blood.bloodrequest.application.dto.BloodRequestResponse;
import com.nhutruong.blood.bloodrequest.application.dto.CreateBloodRequestRequest;
import com.nhutruong.blood.bloodrequest.application.dto.ProcessBloodRequestRequest;
import com.nhutruong.blood.bloodrequest.domain.BloodRequest;
import com.nhutruong.blood.identity.domain.Role;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.shared.api.ApiResponse;
import com.nhutruong.blood.shared.security.SessionUser;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class BloodRequestController {
    private final BloodRequestService bloodRequestService;

    public BloodRequestController(BloodRequestService bloodRequestService) {
        this.bloodRequestService = bloodRequestService;
    }

    @PostMapping({"/api/request-blood", "/api/medicalcenter/request"})
    public ApiResponse<BloodRequestResponse> createRequest(
            @Valid @RequestBody CreateBloodRequestRequest request,
            HttpSession session
    ) {
        User medicalCenter = SessionUser.requireRole(session, Role.MEDICALCENTER);
        BloodRequest bloodRequest = bloodRequestService.createRequest(request, medicalCenter);
        return ApiResponse.success("Blood request submitted", BloodRequestResponse.from(bloodRequest));
    }

    @GetMapping("/api/medicalcenter/my-requests")
    public ApiResponse<List<BloodRequestResponse>> getMyRequests(HttpSession session) {
        User medicalCenter = SessionUser.requireRole(session, Role.MEDICALCENTER);
        List<BloodRequestResponse> response = bloodRequestService.myRequests(medicalCenter).stream()
                .map(BloodRequestResponse::from)
                .toList();
        return ApiResponse.success(response);
    }

    @GetMapping("/api/staff/requests")
    public ApiResponse<List<BloodRequestResponse>> getPendingRequests(HttpSession session) {
        SessionUser.requireRole(session, Role.STAFF);
        List<BloodRequestResponse> response = bloodRequestService.pendingRequests().stream()
                .map(BloodRequestResponse::from)
                .toList();
        return ApiResponse.success(response);
    }

    @PostMapping("/api/staff/process-request/{id}")
    public ApiResponse<BloodRequestResponse> processRequest(
            @PathVariable Long id,
            @Valid @RequestBody ProcessBloodRequestRequest request,
            HttpSession session
    ) {
        User staff = SessionUser.requireRole(session, Role.STAFF);
        BloodRequest bloodRequest = bloodRequestService.processRequest(id, request, staff);
        return ApiResponse.success("Blood request processed", BloodRequestResponse.from(bloodRequest));
    }
}

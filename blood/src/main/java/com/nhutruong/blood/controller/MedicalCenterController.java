package com.nhutruong.blood.controller;

import com.nhutruong.blood.dto.ApiResponse;
import com.nhutruong.blood.dto.BloodRequestCreateRequest;
import com.nhutruong.blood.dto.BloodRequestResponse;
import com.nhutruong.blood.entity.Role;
import com.nhutruong.blood.entity.User;
import com.nhutruong.blood.service.CurrentUserService;
import com.nhutruong.blood.service.imple.BloodRequestServiceImple;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class MedicalCenterController {

    private final BloodRequestServiceImple requestService;
    private final CurrentUserService currentUserService;

    public MedicalCenterController(BloodRequestServiceImple requestService, CurrentUserService currentUserService) {
        this.requestService = requestService;
        this.currentUserService = currentUserService;
    }

    @PreAuthorize("hasRole('MEDICALCENTER')")
    @PostMapping("/api/medicalcenter/request")
    public ResponseEntity<ApiResponse<BloodRequestResponse>> createRequest(@Valid @RequestBody BloodRequestCreateRequest request) {
        User currentUser = currentUserService.requireRole(Role.MEDICALCENTER);
        var created = requestService.createRequest(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Blood request created", BloodRequestResponse.from(created)));
    }

    @PreAuthorize("hasRole('MEDICALCENTER')")
    @GetMapping("/api/medicalcenter/my-requests")
    public ApiResponse<List<BloodRequestResponse>> getMyRequests() {
        User currentUser = currentUserService.requireRole(Role.MEDICALCENTER);
        List<BloodRequestResponse> data = requestService.myRequests(currentUser).stream()
                .map(BloodRequestResponse::from)
                .toList();
        return ApiResponse.ok("My blood requests", data);
    }
}

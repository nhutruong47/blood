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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Deprecated
@RestController
public class BloodRequestController {

    private final BloodRequestServiceImple service;
    private final CurrentUserService currentUserService;

    public BloodRequestController(BloodRequestServiceImple service, CurrentUserService currentUserService) {
        this.service = service;
        this.currentUserService = currentUserService;
    }

    @Deprecated
    @PreAuthorize("hasRole('MEDICALCENTER')")
    @PostMapping("/api/request-blood")
    public ResponseEntity<ApiResponse<BloodRequestResponse>> requestBlood(@Valid @RequestBody BloodRequestCreateRequest request) {
        User currentUser = currentUserService.requireRole(Role.MEDICALCENTER);
        var created = service.createRequest(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Blood request created. Use /api/medicalcenter/request for new clients.",
                        BloodRequestResponse.from(created)));
    }
}

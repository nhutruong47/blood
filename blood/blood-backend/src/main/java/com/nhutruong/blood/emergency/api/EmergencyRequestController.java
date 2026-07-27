package com.nhutruong.blood.emergency.api;

import com.nhutruong.blood.emergency.application.EmergencyRequestService;
import com.nhutruong.blood.emergency.application.dto.CreateEmergencyRequest;
import com.nhutruong.blood.emergency.application.dto.EmergencyRequestResponse;
import com.nhutruong.blood.identity.domain.Role;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.shared.api.ApiResponse;
import com.nhutruong.blood.shared.security.SessionUser;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/emergency-requests")
public class EmergencyRequestController {
    private final EmergencyRequestService emergencyRequestService;

    public EmergencyRequestController(EmergencyRequestService emergencyRequestService) {
        this.emergencyRequestService = emergencyRequestService;
    }

    @PostMapping
    public ApiResponse<EmergencyRequestResponse> create(
            @Valid @RequestBody CreateEmergencyRequest request,
            HttpSession session
    ) {
        User hospital = SessionUser.requireAnyRole(session, Role.HOSPITAL, Role.MEDICALCENTER);
        return ApiResponse.success("Emergency request accepted", emergencyRequestService.create(request, hospital));
    }
}

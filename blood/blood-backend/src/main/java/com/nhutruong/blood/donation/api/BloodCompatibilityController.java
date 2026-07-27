package com.nhutruong.blood.donation.api;

import com.nhutruong.blood.donation.application.BloodCompatibilityService;
import com.nhutruong.blood.donation.application.dto.BloodCompatibilityResponse;
import com.nhutruong.blood.shared.api.ApiResponse;
import com.nhutruong.blood.shared.domain.BloodGroup;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/blood-compatibility")
public class BloodCompatibilityController {
    private final BloodCompatibilityService compatibilityService;

    public BloodCompatibilityController(BloodCompatibilityService compatibilityService) {
        this.compatibilityService = compatibilityService;
    }

    @GetMapping
    public ApiResponse<List<BloodCompatibilityResponse>> all() {
        return ApiResponse.success(compatibilityService.all());
    }

    @GetMapping("/{bloodGroup}")
    public ApiResponse<BloodCompatibilityResponse> byBloodGroup(@PathVariable BloodGroup bloodGroup) {
        return ApiResponse.success(compatibilityService.forGroup(bloodGroup));
    }
}

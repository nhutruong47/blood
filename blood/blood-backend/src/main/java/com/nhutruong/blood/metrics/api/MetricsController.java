package com.nhutruong.blood.metrics.api;

import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.metrics.application.MetricsService;
import com.nhutruong.blood.shared.api.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/metrics")
public class MetricsController {
    private final MetricsService metricsService;

    public MetricsController(MetricsService metricsService) {
        this.metricsService = metricsService;
    }

    @GetMapping("/hospital")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ApiResponse<MetricsService.HospitalMetrics> getHospitalMetrics(@AuthenticationPrincipal User user) {
        return ApiResponse.success(metricsService.getHospitalMetrics(user.getId()));
    }
}

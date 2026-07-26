package com.nhutruong.blood.organization.api;

import com.nhutruong.blood.organization.application.OrganizationService;
import com.nhutruong.blood.organization.application.dto.CreateOrganizationRequest;
import com.nhutruong.blood.organization.application.dto.OrganizationResponse;
import com.nhutruong.blood.shared.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {
    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @PostMapping
    public ApiResponse<OrganizationResponse> create(@Valid @RequestBody CreateOrganizationRequest request) {
        return ApiResponse.success("Organization created", OrganizationResponse.from(organizationService.create(request)));
    }

    @PostMapping("/{id}/verify")
    public ApiResponse<OrganizationResponse> verify(@PathVariable Long id) {
        return ApiResponse.success("Organization verified", OrganizationResponse.from(organizationService.verify(id)));
    }

    @GetMapping
    public ApiResponse<List<OrganizationResponse>> all() {
        return ApiResponse.success(organizationService.all().stream().map(OrganizationResponse::from).toList());
    }
}

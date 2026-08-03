package com.nhutruong.blood.controller;

import com.nhutruong.blood.dto.ApiResponse;
import com.nhutruong.blood.dto.AuditLogResponse;
import com.nhutruong.blood.dto.UserResponse;
import com.nhutruong.blood.dto.UserRoleUpdateRequest;
import com.nhutruong.blood.dto.UserStatusUpdateRequest;
import com.nhutruong.blood.entity.Role;
import com.nhutruong.blood.entity.User;
import com.nhutruong.blood.repository.AuditLogRepository;
import com.nhutruong.blood.service.AdminUserService;
import com.nhutruong.blood.service.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class AdminController {

    private final AdminUserService adminUserService;
    private final CurrentUserService currentUserService;
    private final AuditLogRepository auditLogRepository;

    public AdminController(
            AdminUserService adminUserService,
            CurrentUserService currentUserService,
            AuditLogRepository auditLogRepository
    ) {
        this.adminUserService = adminUserService;
        this.currentUserService = currentUserService;
        this.auditLogRepository = auditLogRepository;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/admin/users")
    public ApiResponse<List<UserResponse>> users() {
        List<UserResponse> data = adminUserService.findAll().stream()
                .map(UserResponse::from)
                .toList();
        return ApiResponse.ok("Users", data);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/admin/users/{id}")
    public ApiResponse<UserResponse> user(@PathVariable Long id) {
        return ApiResponse.ok("User", UserResponse.from(adminUserService.findById(id)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/api/admin/users/{id}/role")
    public ApiResponse<UserResponse> updateRole(@PathVariable Long id, @Valid @RequestBody UserRoleUpdateRequest request) {
        User admin = currentUserService.requireRole(Role.ADMIN);
        return ApiResponse.ok("User role updated", UserResponse.from(adminUserService.updateRole(id, request, admin)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/api/admin/users/{id}/status")
    public ApiResponse<UserResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody UserStatusUpdateRequest request) {
        User admin = currentUserService.requireRole(Role.ADMIN);
        return ApiResponse.ok("User status updated", UserResponse.from(adminUserService.updateStatus(id, request, admin)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/admin/audit-logs")
    public ApiResponse<List<AuditLogResponse>> auditLogs() {
        List<AuditLogResponse> data = auditLogRepository.findAll().stream()
                .map(AuditLogResponse::from)
                .toList();
        return ApiResponse.ok("Audit logs", data);
    }
}

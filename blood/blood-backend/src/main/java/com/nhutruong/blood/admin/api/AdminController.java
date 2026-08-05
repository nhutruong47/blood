package com.nhutruong.blood.admin.api;

import com.nhutruong.blood.admin.application.AdminService;
import com.nhutruong.blood.audit.domain.AuditAction;
import com.nhutruong.blood.audit.domain.AuditEvent;
import com.nhutruong.blood.identity.application.dto.CurrentUserResponse;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.notification.domain.NotificationMessage;
import com.nhutruong.blood.shared.api.ApiResponse;
import com.nhutruong.blood.shared.exception.BusinessException;
import com.nhutruong.blood.shared.exception.ErrorCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin-scoped endpoints required by the frontend dashboard surfaces.
 * All write/admin endpoints require ADMIN / SUPER_ADMIN role.
 */
@RestController
@RequestMapping("/api")
public class AdminController {
    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/admin/users/count")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ApiResponse<Map<String, Long>> usersCount() {
        return ApiResponse.success(Map.of("total", adminService.countUsers()));
    }

    /** Returns a safe DTO — never expose raw User entities to avoid leaking password hashes. */
    @GetMapping("/admin/users")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ApiResponse<List<CurrentUserResponse>> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        size = Math.min(Math.max(size, 1), 200);
        var pageable = PageRequest.of(Math.max(page, 0), size, Sort.by("id").descending());
        return ApiResponse.success(adminService.listUsers(pageable));
    }

    @GetMapping("/admin/audit-logs")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ApiResponse<List<AuditEvent>> auditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size
    ) {
        size = Math.min(Math.max(size, 1), 500);
        var pageable = PageRequest.of(Math.max(page, 0), size, Sort.by("createdAt").descending());
        return ApiResponse.success(adminService.listAuditLogs(pageable));
    }

    /** Notifications are user-scoped — any authenticated user can read their own. */
    @GetMapping("/notifications")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<NotificationMessage>> myNotifications(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "50") int size
    ) {
        if (user == null) {
            throw new BusinessException(ErrorCode.UNAUTHENTICATED, "Authentication required");
        }
        size = Math.min(Math.max(size, 1), 200);
        return ApiResponse.success(adminService.listNotificationsForUser(user.getId(), size));
    }

    /** Marking a notification read requires ownership — verify recipient matches the authenticated user. */
    @PostMapping("/notifications/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> markNotificationRead(
            @PathVariable long id,
            @AuthenticationPrincipal User user
    ) {
        if (user == null) {
            throw new BusinessException(ErrorCode.UNAUTHENTICATED, "Authentication required");
        }
        adminService.markNotificationRead(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked read", null));
    }

    @PostMapping("/admin/audit-logs")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ApiResponse<Void> appendAuditNote(
            @AuthenticationPrincipal User user,
            @RequestParam String entityType,
            @RequestParam String entityId,
            @RequestParam String reason
    ) {
        adminService.recordAudit(
                user,
                AuditAction.UPDATE,
                entityType,
                entityId,
                reason
        );
        return ApiResponse.success("Audit note recorded", null);
    }
}

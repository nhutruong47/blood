package com.nhutruong.blood.admin.api;

import com.nhutruong.blood.admin.application.AdminService;
import com.nhutruong.blood.audit.domain.AuditAction;
import com.nhutruong.blood.audit.domain.AuditEvent;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.notification.domain.NotificationMessage;
import com.nhutruong.blood.shared.api.ApiResponse;
import com.nhutruong.blood.shared.exception.BusinessException;
import com.nhutruong.blood.shared.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Admin-scoped endpoints required by the frontend dashboard surfaces:
 *  - GET  /api/admin/users/count
 *  - GET  /api/admin/audit-logs
 *  - GET  /api/notifications
 *  - POST /api/notifications/{id}/read
 *
 * All write/admin endpoints require ADMIN / SUPER_ADMIN role.
 */
@Slf4j
@RestController
@RequestMapping("/api")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/admin/users/count")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ApiResponse<Map<String, Long>> usersCount() {
        return ApiResponse.success(Map.of("total", adminService.countUsers()));
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ApiResponse<List<User>> listUsers(
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

    @GetMapping("/notifications")
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

    @PostMapping("/notifications/{id}/read")
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

    /**
     * Convenience endpoint that records an admin-side event into the audit log.
     * Useful when an admin wants to attach an out-of-band note to an entity.
     */
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
package com.nhutruong.blood.admin.application;

import com.nhutruong.blood.audit.application.AuditService;
import com.nhutruong.blood.audit.domain.AuditAction;
import com.nhutruong.blood.audit.domain.AuditEvent;
import com.nhutruong.blood.audit.infrastructure.AuditEventRepository;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.identity.infrastructure.UserRepository;
import com.nhutruong.blood.notification.domain.NotificationMessage;
import com.nhutruong.blood.notification.domain.NotificationStatus;
import com.nhutruong.blood.notification.infrastructure.NotificationMessageRepository;
import com.nhutruong.blood.shared.exception.BusinessException;
import com.nhutruong.blood.shared.exception.ErrorCode;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Read-side service used by the AdminController. Exposes simple aggregate
 * queries (user count, audit log page) and a write helper for marking
 * notifications read.
 */
@Service
public class AdminService {

    private final UserRepository userRepository;
    private final AuditEventRepository auditEventRepository;
    private final NotificationMessageRepository notificationMessageRepository;
    private final AuditService auditService;

    public AdminService(
            UserRepository userRepository,
            AuditEventRepository auditEventRepository,
            NotificationMessageRepository notificationMessageRepository,
            AuditService auditService
    ) {
        this.userRepository = userRepository;
        this.auditEventRepository = auditEventRepository;
        this.notificationMessageRepository = notificationMessageRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public long countUsers() {
        return userRepository.count();
    }

    @Transactional(readOnly = true)
    public List<User> listUsers(Pageable pageable) {
        return userRepository.findAll(pageable).getContent();
    }

    @Transactional(readOnly = true)
    public List<AuditEvent> listAuditLogs(Pageable pageable) {
        return auditEventRepository.findAll(pageable).getContent();
    }

    @Transactional(readOnly = true)
    public List<NotificationMessage> listNotificationsForUser(long userId, int limit) {
        // Simple in-memory limit. A richer query (paginated, status filtered)
        // can replace this when the notification volume grows.
        List<NotificationMessage> all = notificationMessageRepository.findAll();
        return all.stream()
                .filter(n -> n.getRecipient() != null && userId == n.getRecipient().getId())
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(limit)
                .toList();
    }

    @Transactional
    public void markNotificationRead(long userId, long notificationId) {
        NotificationMessage msg = notificationMessageRepository.findById(notificationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Notification not found"));
        if (msg.getRecipient() == null || msg.getRecipient().getId() != userId) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "You cannot modify this notification");
        }
        msg.setStatus(NotificationStatus.SENT);
        notificationMessageRepository.save(msg);
    }

    @Transactional
    public void recordAudit(
            User actor,
            AuditAction action,
            String entityType,
            String entityId,
            String reason
    ) {
        auditService.record(actor, action, entityType, entityId, reason);
    }
}
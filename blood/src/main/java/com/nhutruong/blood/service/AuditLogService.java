package com.nhutruong.blood.service;

import com.nhutruong.blood.entity.AuditLog;
import com.nhutruong.blood.entity.User;
import com.nhutruong.blood.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void record(User actor, String action, String entityType, Long entityId, String oldValue, String newValue) {
        AuditLog log = new AuditLog();
        log.setActorUserId(actor == null ? null : actor.getId());
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setOldValue(oldValue);
        log.setNewValue(newValue);
        log.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(log);
    }
}

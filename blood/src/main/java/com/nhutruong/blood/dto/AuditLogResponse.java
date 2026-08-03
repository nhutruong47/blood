package com.nhutruong.blood.dto;

import com.nhutruong.blood.entity.AuditLog;

import java.time.LocalDateTime;

public record AuditLogResponse(
        Long id,
        Long actorUserId,
        String action,
        String entityType,
        Long entityId,
        String oldValue,
        String newValue,
        LocalDateTime timestamp,
        String ipAddress
) {
    public static AuditLogResponse from(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getActorUserId(),
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                log.getOldValue(),
                log.getNewValue(),
                log.getTimestamp(),
                log.getIpAddress()
        );
    }
}

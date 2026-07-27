package com.nhutruong.blood.audit.application;

import com.nhutruong.blood.audit.domain.AuditAction;
import com.nhutruong.blood.audit.domain.AuditEvent;
import com.nhutruong.blood.audit.infrastructure.AuditEventRepository;
import com.nhutruong.blood.identity.domain.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {
    private final AuditEventRepository auditEventRepository;

    public AuditService(AuditEventRepository auditEventRepository) {
        this.auditEventRepository = auditEventRepository;
    }

    @Transactional
    public AuditEvent record(User actor, AuditAction action, String entityType, Object entityId, String reason) {
        AuditEvent event = new AuditEvent();
        if (actor != null) {
            event.setActorId(actor.getId());
            event.setActorRole(actor.getRole().name());
        }
        event.setAction(action);
        event.setEntityType(entityType);
        event.setEntityId(String.valueOf(entityId));
        event.setReason(reason);
        return auditEventRepository.save(event);
    }
}

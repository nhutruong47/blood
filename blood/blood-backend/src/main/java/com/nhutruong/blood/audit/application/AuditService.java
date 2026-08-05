package com.nhutruong.blood.audit.application;

import com.nhutruong.blood.audit.domain.AuditAction;
import com.nhutruong.blood.audit.domain.AuditEvent;
import com.nhutruong.blood.audit.infrastructure.AuditEventRepository;
import com.nhutruong.blood.identity.domain.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {
    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final AuditEventRepository auditEventRepository;

    public AuditService(AuditEventRepository auditEventRepository) {
        this.auditEventRepository = auditEventRepository;
    }

    @Transactional
    public AuditEvent log(Long userId, String actorRole, AuditAction action,
                          String entityType, String entityId, String reason) {
        AuditEvent event = new AuditEvent();
        event.setActorId(userId);
        event.setActorRole(actorRole);
        event.setAction(action);
        event.setEntityType(entityType);
        event.setEntityId(entityId);
        event.setReason(reason);
        return auditEventRepository.save(event);
    }

    @Transactional
    public AuditEvent record(User actor, AuditAction action, String entityType, Object entityId, String reason) {
        User effectiveActor = actor != null ? actor : currentUser();
        return log(
                effectiveActor != null ? effectiveActor.getId() : null,
                effectiveActor != null && effectiveActor.getRole() != null ? effectiveActor.getRole().name() : "SYSTEM",
                action,
                entityType,
                String.valueOf(entityId),
                reason
        );
    }

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            return user;
        }
        return null;
    }
}

package com.nhutruong.blood.audit.infrastructure;

import com.nhutruong.blood.audit.domain.AuditEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {
    List<AuditEvent> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, String entityId);
}

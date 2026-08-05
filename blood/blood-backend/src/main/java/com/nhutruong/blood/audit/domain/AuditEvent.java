package com.nhutruong.blood.audit.domain;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@jakarta.persistence.Entity
@org.hibernate.envers.Audited
@Table(indexes = {
        @Index(name = "idx_audit_actor", columnList = "actor_id"),
        @Index(name = "idx_audit_entity", columnList = "entity_type, entity_id"),
        @Index(name = "idx_audit_created_at", columnList = "created_at")
})
public class AuditEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "actor_id")
    private Long actorId;

    @Column(name = "actor_role")
    private String actorRole;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuditAction action;

    @Column(name = "entity_type", nullable = false)
    private String entityType;

    @Column(name = "entity_id", nullable = false)
    private String entityId;

    @Column(length = 1000)
    private String reason;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "device_id")
    private String deviceId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public Long getActorId() { return actorId; }
    public String getActorRole() { return actorRole; }
    public AuditAction getAction() { return action; }
    public String getEntityType() { return entityType; }
    public String getEntityId() { return entityId; }
    public String getReason() { return reason; }
    public String getIpAddress() { return ipAddress; }
    public String getDeviceId() { return deviceId; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setActorId(Long v) { this.actorId = v; }
    public void setActorRole(String v) { this.actorRole = v; }
    public void setAction(AuditAction v) { this.action = v; }
    public void setEntityType(String v) { this.entityType = v; }
    public void setEntityId(String v) { this.entityId = v; }
    public void setReason(String v) { this.reason = v; }
    public void setIpAddress(String v) { this.ipAddress = v; }
    public void setDeviceId(String v) { this.deviceId = v; }
    public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

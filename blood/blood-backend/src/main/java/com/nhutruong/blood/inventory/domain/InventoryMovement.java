package com.nhutruong.blood.inventory.domain;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@jakarta.persistence.Entity
@org.hibernate.envers.Audited
@Table(indexes = {
        @Index(name = "idx_inventory_movement_unit", columnList = "blood_unit_id"),
        @Index(name = "idx_inventory_movement_created", columnList = "created_at")
})
public class InventoryMovement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "blood_unit_id")
    private BloodUnit bloodUnit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InventoryMovementType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status")
    private BloodUnitStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false)
    private BloodUnitStatus toStatus;

    @Column(length = 1000)
    private String reason;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public BloodUnit getBloodUnit() {
        return bloodUnit;
    }

    public InventoryMovementType getType() {
        return type;
    }

    public BloodUnitStatus getFromStatus() {
        return fromStatus;
    }

    public BloodUnitStatus getToStatus() {
        return toStatus;
    }

    public String getReason() {
        return reason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setBloodUnit(BloodUnit bloodUnit) {
        this.bloodUnit = bloodUnit;
    }

    public void setType(InventoryMovementType type) {
        this.type = type;
    }

    public void setFromStatus(BloodUnitStatus fromStatus) {
        this.fromStatus = fromStatus;
    }

    public void setToStatus(BloodUnitStatus toStatus) {
        this.toStatus = toStatus;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

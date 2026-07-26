package com.nhutruong.blood.inventory.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
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

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

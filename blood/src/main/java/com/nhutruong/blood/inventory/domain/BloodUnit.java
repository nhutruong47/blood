package com.nhutruong.blood.inventory.domain;

import com.nhutruong.blood.bloodrequest.domain.BloodRequest;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.shared.domain.BloodGroup;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.envers.Audited;
import com.nhutruong.blood.shared.domain.BaseAuditEntity;

@Entity
@Data
@NoArgsConstructor
@Audited
@Table(
        uniqueConstraints = @UniqueConstraint(name = "uk_blood_unit_bag_code", columnNames = "bag_code"),
        indexes = {
                @Index(name = "idx_blood_unit_stock", columnList = "blood_group, component_type, status, expiry_date"),
                @Index(name = "idx_blood_unit_reserved_request", columnList = "reserved_request_id")
        }
)
public class BloodUnit extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bag_code", nullable = false, unique = true)
    private String bagCode;

    @ManyToOne
    private User donor;

    @Enumerated(EnumType.STRING)
    @Column(name = "blood_group", nullable = false)
    private BloodGroup bloodGroup;

    @Enumerated(EnumType.STRING)
    @Column(name = "component_type", nullable = false)
    private BloodComponentType componentType;

    @Column(name = "volume_ml", nullable = false)
    private Integer volumeMl;

    @Column(name = "collection_date", nullable = false)
    private LocalDate collectionDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "storage_location")
    private String storageLocation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodUnitStatus status = BloodUnitStatus.QUARANTINED;

    @Enumerated(EnumType.STRING)
    @Column(name = "lab_test_result", nullable = false)
    private LabTestResult labTestResult = LabTestResult.PENDING;

    @ManyToOne
    @JoinColumn(name = "reserved_request_id")
    private BloodRequest reservedFor;

    @Version
    private Long version;

    public boolean isExpired(LocalDate today) {
        return expiryDate != null && expiryDate.isBefore(today);
    }
}

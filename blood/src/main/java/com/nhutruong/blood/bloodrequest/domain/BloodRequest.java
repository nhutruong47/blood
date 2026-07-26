package com.nhutruong.blood.bloodrequest.domain;

import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.inventory.domain.BloodComponentType;
import com.nhutruong.blood.shared.domain.BloodGroup;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
public class BloodRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodGroup bloodGroup;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Urgency urgency;

    @Column(nullable = false)
    private String recipientInfo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodComponentType componentType = BloodComponentType.WHOLE_BLOOD;

    @Column(nullable = false)
    private Integer quantityUnits = 1;

    private Double latitude;
    private Double longitude;

    @ManyToOne(optional = false)
    private User medicalCenter;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodRequestStatus status = BloodRequestStatus.SUBMITTED;

    private String staffResponse;

    @ManyToOne
    private User approvedBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Version
    private Long version;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

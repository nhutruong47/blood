package com.nhutruong.blood.bloodrequest.domain;

import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.inventory.domain.BloodComponentType;
import com.nhutruong.blood.shared.domain.BloodGroup;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import org.hibernate.envers.Audited;
import com.nhutruong.blood.shared.domain.BaseAuditEntity;

@Entity
@Data
@NoArgsConstructor
@Audited
public class BloodRequest extends BaseAuditEntity {

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

    @Version
    private Long version;
}

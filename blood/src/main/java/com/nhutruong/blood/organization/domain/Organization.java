package com.nhutruong.blood.organization.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(
        uniqueConstraints = @UniqueConstraint(name = "uk_organization_code", columnNames = "code"),
        indexes = {
                @Index(name = "idx_organization_type_status", columnList = "type, status")
        }
)
public class Organization {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrganizationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrganizationStatus status = OrganizationStatus.PENDING_VERIFICATION;

    private String licenseNumber;
    private String phone;
    private String email;
    private String address;
    private Double latitude;
    private Double longitude;
    private LocalDateTime createdAt;
    private LocalDateTime verifiedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

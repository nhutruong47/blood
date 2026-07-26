package com.nhutruong.blood.donation.domain;

import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.shared.domain.BloodGroup;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
public class DonationRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String medicalCenterName;
    private LocalDate donationDate;

    @Enumerated(EnumType.STRING)
    private BloodGroup bloodGroup;

    private String healthStatus;
    private double weight;
    private int amount;
    private int age;

    @ManyToOne(optional = false)
    private User donor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DonationRegistrationStatus status = DonationRegistrationStatus.SUBMITTED;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

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

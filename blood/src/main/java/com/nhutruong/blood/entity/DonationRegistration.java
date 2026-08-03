package com.nhutruong.blood.entity;

import com.nhutruong.blood.enums.DonationRegistrationStatus;
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

    private String medicalCenter;
    private LocalDate donationDate;
    private String bloodGroup;
    private String healthStatus;
    private double weight;
    private int amount;
    private int age;


    @ManyToOne
    private User donor;

    @Deprecated
    private boolean approved = false; // mặc định chờ duyệt

    @Enumerated(EnumType.STRING)
    private DonationRegistrationStatus status = DonationRegistrationStatus.PENDING;

    @ManyToOne
    private User approvedBy;

    private LocalDateTime approvedAt;

    @ManyToOne
    private User rejectedBy;

    private LocalDateTime rejectedAt;

    @ManyToOne
    private User completedBy;

    private LocalDateTime completedAt;

    private String decisionReason;

    private boolean inventoryRecorded = false;
}


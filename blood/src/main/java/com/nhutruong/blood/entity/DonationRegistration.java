package com.nhutruong.blood.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

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

    private boolean approved = false; // mặc định chờ duyệt
}


package com.nhutruong.blood.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class DonationSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime donationTime;

    @ManyToOne
    private DonationLocation location;
}


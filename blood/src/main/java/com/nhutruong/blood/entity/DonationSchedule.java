package com.nhutruong.blood.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
public class DonationSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime donationTime;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer capacity;

    @ManyToOne
    private DonationLocation location;
}


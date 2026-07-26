package com.nhutruong.blood.inventory.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(indexes = {
        @Index(name = "idx_lab_test_unit", columnList = "blood_unit_id")
})
public class LabTest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "blood_unit_id")
    private BloodUnit bloodUnit;

    @Column(nullable = false)
    private String testType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LabTestResult result;

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false)
    private LocalDateTime testedAt;

    @PrePersist
    void onCreate() {
        testedAt = LocalDateTime.now();
    }
}

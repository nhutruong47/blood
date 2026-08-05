package com.nhutruong.blood.inventory.domain;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@jakarta.persistence.Entity
@org.hibernate.envers.Audited
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

    public Long getId() {
        return id;
    }

    public BloodUnit getBloodUnit() {
        return bloodUnit;
    }

    public String getTestType() {
        return testType;
    }

    public LabTestResult getResult() {
        return result;
    }

    public String getNotes() {
        return notes;
    }

    public LocalDateTime getTestedAt() {
        return testedAt;
    }

    public void setBloodUnit(BloodUnit bloodUnit) {
        this.bloodUnit = bloodUnit;
    }

    public void setTestType(String testType) {
        this.testType = testType;
    }

    public void setResult(LabTestResult result) {
        this.result = result;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public void setTestedAt(LocalDateTime testedAt) {
        this.testedAt = testedAt;
    }

    @PrePersist
    void onCreate() {
        testedAt = LocalDateTime.now();
    }
}

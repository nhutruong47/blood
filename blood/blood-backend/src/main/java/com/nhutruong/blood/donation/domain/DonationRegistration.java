package com.nhutruong.blood.donation.domain;

import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.shared.domain.BloodGroup;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.hibernate.envers.Audited;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Audited
@Entity
public class DonationRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String medicalCenterName;
    private LocalDate donationDate;

    @Enumerated(EnumType.STRING)
    private BloodGroup bloodGroup;

    private String healthStatus;
    private String donorNotes;
    private double weight;
    private int amount;
    private int age;

    @ManyToOne(optional = false)
    private User donor;

    @ManyToOne
    private DonationSchedule schedule;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DonationRegistrationStatus status = DonationRegistrationStatus.SUBMITTED;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final DonationRegistration e = new DonationRegistration();
        public Builder medicalCenterName(String v) { e.medicalCenterName = v; return this; }
        public Builder donationDate(LocalDate v) { e.donationDate = v; return this; }
        public Builder bloodGroup(BloodGroup v) { e.bloodGroup = v; return this; }
        public Builder healthStatus(String v) { e.healthStatus = v; return this; }
        public Builder donorNotes(String v) { e.donorNotes = v; return this; }
        public Builder weight(double v) { e.weight = v; return this; }
        public Builder amount(int v) { e.amount = v; return this; }
        public Builder age(int v) { e.age = v; return this; }
        public Builder donor(User v) { e.donor = v; return this; }
        public Builder schedule(DonationSchedule v) { e.schedule = v; return this; }
        public Builder status(DonationRegistrationStatus v) { e.status = v; return this; }
        public DonationRegistration build() { return e; }
    }

    // Getters
    public Long getId() { return id; }
    public String getMedicalCenterName() { return medicalCenterName; }
    public LocalDate getDonationDate() { return donationDate; }
    public BloodGroup getBloodGroup() { return bloodGroup; }
    public String getHealthStatus() { return healthStatus; }
    public String getDonorNotes() { return donorNotes; }
    public double getWeight() { return weight; }
    public int getAmount() { return amount; }
    public int getAge() { return age; }
    public User getDonor() { return donor; }
    public DonationSchedule getSchedule() { return schedule; }
    public DonationRegistrationStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // Setters
    public void setId(Long v) { this.id = v; }
    public void setMedicalCenterName(String v) { this.medicalCenterName = v; }
    public void setDonationDate(LocalDate v) { this.donationDate = v; }
    public void setBloodGroup(BloodGroup v) { this.bloodGroup = v; }
    public void setHealthStatus(String v) { this.healthStatus = v; }
    public void setDonorNotes(String v) { this.donorNotes = v; }
    public void setWeight(double v) { this.weight = v; }
    public void setAmount(int v) { this.amount = v; }
    public void setAge(int v) { this.age = v; }
    public void setDonor(User v) { this.donor = v; }
    public void setSchedule(DonationSchedule v) { this.schedule = v; }
    public void setStatus(DonationRegistrationStatus v) { this.status = v; }
    public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
    public void setUpdatedAt(LocalDateTime v) { this.updatedAt = v; }

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

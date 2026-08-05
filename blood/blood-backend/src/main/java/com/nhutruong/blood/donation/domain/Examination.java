package com.nhutruong.blood.donation.domain;

import com.nhutruong.blood.identity.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.envers.Audited;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Audited
@Entity
@Table(name = "examinations")
public class Examination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "donation_registration_id")
    private DonationRegistration donationRegistration;

    private Double bloodPressureSystolic;
    private Double bloodPressureDiastolic;
    private Double heartRate;
    private Double temperature;
    private Double hemoglobinLevel;

    @Enumerated(EnumType.STRING)
    private ExaminationStatus status;

    private String deferralReason;
    private LocalDateTime nextEligibleDate;

    @ManyToOne
    private User reviewedBy;

    private LocalDateTime reviewedAt;
    private String healthNotes;

    public enum ExaminationStatus {
        NEEDS_DOCTOR_REVIEW, PASSED, FAILED
    }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final Examination e = new Examination();
        public Builder donationRegistration(DonationRegistration v) { e.donationRegistration = v; return this; }
        public Builder bloodPressureSystolic(Double v) { e.bloodPressureSystolic = v; return this; }
        public Builder bloodPressureDiastolic(Double v) { e.bloodPressureDiastolic = v; return this; }
        public Builder heartRate(Double v) { e.heartRate = v; return this; }
        public Builder temperature(Double v) { e.temperature = v; return this; }
        public Builder hemoglobinLevel(Double v) { e.hemoglobinLevel = v; return this; }
        public Builder status(ExaminationStatus v) { e.status = v; return this; }
        public Builder deferralReason(String v) { e.deferralReason = v; return this; }
        public Builder nextEligibleDate(LocalDateTime v) { e.nextEligibleDate = v; return this; }
        public Builder reviewedBy(User v) { e.reviewedBy = v; return this; }
        public Builder reviewedAt(LocalDateTime v) { e.reviewedAt = v; return this; }
        public Builder healthNotes(String v) { e.healthNotes = v; return this; }
        public Examination build() { return e; }
    }

    // Getters
    public Long getId() { return id; }
    public DonationRegistration getDonationRegistration() { return donationRegistration; }
    public Double getBloodPressureSystolic() { return bloodPressureSystolic; }
    public Double getBloodPressureDiastolic() { return bloodPressureDiastolic; }
    public Double getHeartRate() { return heartRate; }
    public Double getTemperature() { return temperature; }
    public Double getHemoglobinLevel() { return hemoglobinLevel; }
    public ExaminationStatus getStatus() { return status; }
    public String getDeferralReason() { return deferralReason; }
    public LocalDateTime getNextEligibleDate() { return nextEligibleDate; }
    public User getReviewedBy() { return reviewedBy; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public String getHealthNotes() { return healthNotes; }

    // Setters
    public void setId(Long v) { this.id = v; }
    public void setDonationRegistration(DonationRegistration v) { this.donationRegistration = v; }
    public void setBloodPressureSystolic(Double v) { this.bloodPressureSystolic = v; }
    public void setBloodPressureDiastolic(Double v) { this.bloodPressureDiastolic = v; }
    public void setHeartRate(Double v) { this.heartRate = v; }
    public void setTemperature(Double v) { this.temperature = v; }
    public void setHemoglobinLevel(Double v) { this.hemoglobinLevel = v; }
    public void setStatus(ExaminationStatus v) { this.status = v; }
    public void setDeferralReason(String v) { this.deferralReason = v; }
    public void setNextEligibleDate(LocalDateTime v) { this.nextEligibleDate = v; }
    public void setReviewedBy(User v) { this.reviewedBy = v; }
    public void setReviewedAt(LocalDateTime v) { this.reviewedAt = v; }
    public void setHealthNotes(String v) { this.healthNotes = v; }

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = ExaminationStatus.NEEDS_DOCTOR_REVIEW;
        }
    }
}

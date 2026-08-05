package com.nhutruong.blood.matching.domain;

import com.nhutruong.blood.bloodrequest.domain.BloodRequest;
import com.nhutruong.blood.identity.domain.User;
import jakarta.persistence.Column;
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
        @Index(name = "idx_match_request_score", columnList = "blood_request_id, priority_score"),
        @Index(name = "idx_match_donor", columnList = "donor_id")
})
public class DonorMatchRecommendation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "blood_request_id")
    private BloodRequest bloodRequest;

    @ManyToOne(optional = false)
    @JoinColumn(name = "donor_id")
    private User donor;

    private Integer bloodGroupScore;
    private Integer availabilityScore;
    private Integer healthScore;
    private Double distanceKm;

    @Column(name = "priority_score", nullable = false)
    private Integer priorityScore;

    @Column(length = 500)
    private String reason;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public BloodRequest getBloodRequest() {
        return bloodRequest;
    }

    public User getDonor() {
        return donor;
    }

    public Integer getBloodGroupScore() {
        return bloodGroupScore;
    }

    public Integer getAvailabilityScore() {
        return availabilityScore;
    }

    public Integer getHealthScore() {
        return healthScore;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public Integer getPriorityScore() {
        return priorityScore;
    }

    public String getReason() {
        return reason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setBloodRequest(BloodRequest bloodRequest) {
        this.bloodRequest = bloodRequest;
    }

    public void setDonor(User donor) {
        this.donor = donor;
    }

    public void setBloodGroupScore(Integer bloodGroupScore) {
        this.bloodGroupScore = bloodGroupScore;
    }

    public void setAvailabilityScore(Integer availabilityScore) {
        this.availabilityScore = availabilityScore;
    }

    public void setHealthScore(Integer healthScore) {
        this.healthScore = healthScore;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public void setPriorityScore(Integer priorityScore) {
        this.priorityScore = priorityScore;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

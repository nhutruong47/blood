package com.nhutruong.blood.matching.domain;

import com.nhutruong.blood.bloodrequest.domain.BloodRequest;
import com.nhutruong.blood.identity.domain.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
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

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

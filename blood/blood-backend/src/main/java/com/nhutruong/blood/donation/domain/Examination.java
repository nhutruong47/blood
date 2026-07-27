package com.nhutruong.blood.donation.domain;

import com.nhutruong.blood.identity.domain.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "examinations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = ExaminationStatus.NEEDS_REVIEW;
        }
    }

    public enum ExaminationStatus {
        NEEDS_REVIEW,
        PASSED,
        DEFERRED
    }
}

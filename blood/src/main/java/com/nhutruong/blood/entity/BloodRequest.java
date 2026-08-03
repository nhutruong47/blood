package com.nhutruong.blood.entity;

import com.nhutruong.blood.enums.BloodRequestStatus;
import com.nhutruong.blood.enums.UrgencyLevel;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
public class BloodRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String bloodGroup; // Nhóm máu cần

    @Enumerated(EnumType.STRING)
    private UrgencyLevel urgency = UrgencyLevel.MEDIUM;

    private int amount;

    private String recipientInfo; // Thông tin người nhận máu

    @ManyToOne
    private User medicalCenter; // MEDICALCENTER gửi đơn

    @Enumerated(EnumType.STRING)
    private BloodRequestStatus status = BloodRequestStatus.PENDING;

    private String staffResponse; // Ghi chú hoặc lý do xử lý

    @ManyToOne
    private User approvedBy; // STAFF đã xử lý (nếu có)

    @ManyToOne
    private User processedBy;

    private LocalDateTime processedAt;

    private String rejectionReason;

    private LocalDateTime fulfilledAt;

    private LocalDateTime cancelledAt;

    private String fulfilledBloodGroup;
}

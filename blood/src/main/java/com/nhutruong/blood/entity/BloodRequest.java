package com.nhutruong.blood.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class BloodRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String bloodGroup; // Nhóm máu cần

    private String urgency; // KHẨN CẤP / CHỜ ĐỢI

    private String recipientInfo; // Thông tin người nhận máu

    @ManyToOne
    private User medicalCenter; // MEDICALCENTER gửi đơn

    private String status = "CHỜ DUYỆT"; // Trạng thái STAFF xử lý

    private String staffResponse; // Ghi chú hoặc lý do xử lý

    @ManyToOne
    private User approvedBy; // STAFF đã xử lý (nếu có)
}

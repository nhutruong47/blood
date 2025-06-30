package com.nhutruong.blood.entity;

public enum Role {
    DONOR,         // Người hiến máu (thay cho USER)
    ADMIN,         // Quản trị viên hệ thống
    STAFF,         // Nhân viên (có thể là của trung tâm y tế)
    MEDICALCENTER  // Đại diện cho cả một trung tâm y tế
}

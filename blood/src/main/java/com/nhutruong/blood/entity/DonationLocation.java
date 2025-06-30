package com.nhutruong.blood.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
public class DonationLocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;              // Tên địa điểm
    private String address;           // Địa chỉ


    @ManyToOne
    private User createdBy;           // MedicalCenter tạo ra địa điểm

    @OneToMany(mappedBy = "location", cascade = CascadeType.ALL)
    private List<DonationSchedule> schedules;
}

package com.nhutruong.blood.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "users") // => ánh xạ bảng "users"



public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String bloodGroup;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Transient
    private String confirmPassword; // Không lưu vào DB
}

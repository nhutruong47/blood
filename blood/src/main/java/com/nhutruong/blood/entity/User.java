package com.nhutruong.blood.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.nhutruong.blood.enums.UserStatus;
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

    @JsonIgnore
    private String password;
    private String firstName;
    private String lastName;
    private String bloodGroup;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    private UserStatus status = UserStatus.ACTIVE;

    @Transient
    @JsonIgnore
    private String confirmPassword; // Không lưu vào DB
}

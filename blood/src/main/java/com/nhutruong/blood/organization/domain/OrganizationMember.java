package com.nhutruong.blood.organization.domain;

import com.nhutruong.blood.identity.domain.Role;
import com.nhutruong.blood.identity.domain.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(indexes = {
        @Index(name = "idx_org_member_user", columnList = "user_id"),
        @Index(name = "idx_org_member_org", columnList = "organization_id")
})
public class OrganizationMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Organization organization;

    @ManyToOne(optional = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private boolean active = true;
    private LocalDateTime joinedAt;

    @PrePersist
    void onCreate() {
        joinedAt = LocalDateTime.now();
    }
}

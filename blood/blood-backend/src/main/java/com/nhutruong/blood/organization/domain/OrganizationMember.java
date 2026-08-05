package com.nhutruong.blood.organization.domain;

import com.nhutruong.blood.identity.domain.Role;
import com.nhutruong.blood.identity.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import com.nhutruong.blood.shared.domain.BaseAuditEntity;

import java.time.LocalDateTime;

@jakarta.persistence.Entity
@org.hibernate.envers.Audited
@Table(indexes = {
        @Index(name = "idx_org_member_user", columnList = "user_id"),
        @Index(name = "idx_org_member_org", columnList = "organization_id")
})
public class OrganizationMember extends BaseAuditEntity {
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

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final OrganizationMember m = new OrganizationMember();

        public Builder id(Long v) { m.id = v; return this; }
        public Builder organization(Organization v) { m.organization = v; return this; }
        public Builder user(User v) { m.user = v; return this; }
        public Builder role(Role v) { m.role = v; return this; }
        public Builder active(boolean v) { m.active = v; return this; }
        public Builder joinedAt(LocalDateTime v) { m.joinedAt = v; return this; }
        public OrganizationMember build() { return m; }
    }

    public Long getId() {
        return id;
    }

    public Organization getOrganization() {
        return organization;
    }

    public User getUser() {
        return user;
    }

    public Role getRole() {
        return role;
    }

    public boolean isActive() {
        return active;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }

    @PrePersist
    void onCreate() {
        joinedAt = LocalDateTime.now();
    }
}

package com.nhutruong.blood.donation.domain;

import com.nhutruong.blood.identity.domain.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@Table(
        indexes = {
                @Index(name = "idx_donation_location_published", columnList = "published"),
                @Index(name = "idx_donation_location_geo", columnList = "latitude, longitude")
        },
        uniqueConstraints = @UniqueConstraint(name = "uk_donation_location_slug", columnNames = "slug")
)
public class DonationLocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    private Double latitude;
    private Double longitude;
    @Column(nullable = false, unique = true)
    private String slug;
    private String seoTitle;

    @Column(length = 500)
    private String seoDescription;

    private boolean published = true;

    @ManyToOne(optional = false)
    private User createdBy;

    @OneToMany(mappedBy = "location", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DonationSchedule> schedules = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

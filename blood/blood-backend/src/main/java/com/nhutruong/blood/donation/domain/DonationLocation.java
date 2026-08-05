package com.nhutruong.blood.donation.domain;

import com.nhutruong.blood.identity.domain.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.hibernate.envers.Audited;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Audited
@Entity
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

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getAddress() { return address; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public String getSlug() { return slug; }
    public String getSeoTitle() { return seoTitle; }
    public String getSeoDescription() { return seoDescription; }
    public boolean isPublished() { return published; }
    public User getCreatedBy() { return createdBy; }
    public List<DonationSchedule> getSchedules() { return schedules; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // Setters
    public void setId(Long v) { this.id = v; }
    public void setName(String v) { this.name = v; }
    public void setAddress(String v) { this.address = v; }
    public void setLatitude(Double v) { this.latitude = v; }
    public void setLongitude(Double v) { this.longitude = v; }
    public void setSlug(String v) { this.slug = v; }
    public void setSeoTitle(String v) { this.seoTitle = v; }
    public void setSeoDescription(String v) { this.seoDescription = v; }
    public void setPublished(boolean v) { this.published = v; }
    public void setCreatedBy(User v) { this.createdBy = v; }
    public void setSchedules(List<DonationSchedule> v) { this.schedules = v; }
    public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
    public void setUpdatedAt(LocalDateTime v) { this.updatedAt = v; }

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

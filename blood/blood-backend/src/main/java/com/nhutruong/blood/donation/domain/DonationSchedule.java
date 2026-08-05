package com.nhutruong.blood.donation.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.envers.Audited;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Audited
@Entity
public class DonationSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime donationTime;

    private Integer capacity;

    @ManyToOne(optional = false)
    private DonationLocation location;

    // Getters
    public Long getId() { return id; }
    public LocalDateTime getDonationTime() { return donationTime; }
    public Integer getCapacity() { return capacity; }
    public DonationLocation getLocation() { return location; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setDonationTime(LocalDateTime donationTime) { this.donationTime = donationTime; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public void setLocation(DonationLocation location) { this.location = location; }
}

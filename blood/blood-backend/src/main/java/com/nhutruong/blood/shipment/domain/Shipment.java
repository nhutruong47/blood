package com.nhutruong.blood.shipment.domain;

import com.nhutruong.blood.bloodrequest.domain.BloodRequest;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "shipments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private BloodRequest bloodRequest;

    @Enumerated(EnumType.STRING)
    private ShipmentStatus status;

    private String courierName;
    private String courierPhone;

    private LocalDateTime pickedUpAt;
    private LocalDateTime deliveredAt;

    private Double temperatureAtPickup;
    private String notes;

    @Builder.Default
    @OneToMany(mappedBy = "shipment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ShipmentCheckpoint> checkpoints = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = ShipmentStatus.CREATED;
        }
    }

    public void addCheckpoint(String location, String description, Double temperature) {
        checkpoints.add(ShipmentCheckpoint.builder()
                .shipment(this)
                .location(location)
                .description(description)
                .temperatureReading(temperature)
                .timestamp(LocalDateTime.now())
                .build());
    }

    public enum ShipmentStatus {
        CREATED,
        PICKED_UP,
        IN_TRANSIT,
        DELIVERED,
        TEMPERATURE_BREACH,
        RETURNED,
        CLOSED
    }
}

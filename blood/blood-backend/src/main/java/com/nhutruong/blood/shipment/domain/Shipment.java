package com.nhutruong.blood.shipment.domain;

import com.nhutruong.blood.bloodrequest.domain.BloodRequest;
import jakarta.persistence.CascadeType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import com.nhutruong.blood.shared.domain.BaseAuditEntity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@jakarta.persistence.Entity
@org.hibernate.envers.Audited
@Table(name = "shipments")
public class Shipment extends BaseAuditEntity {

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

    @OneToMany(mappedBy = "shipment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ShipmentCheckpoint> checkpoints = new ArrayList<>();

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final Shipment s = new Shipment();

        public Builder id(Long v) { s.id = v; return this; }
        public Builder bloodRequest(BloodRequest v) { s.bloodRequest = v; return this; }
        public Builder status(ShipmentStatus v) { s.status = v; return this; }
        public Builder courierName(String v) { s.courierName = v; return this; }
        public Builder courierPhone(String v) { s.courierPhone = v; return this; }
        public Builder pickedUpAt(LocalDateTime v) { s.pickedUpAt = v; return this; }
        public Builder deliveredAt(LocalDateTime v) { s.deliveredAt = v; return this; }
        public Builder temperatureAtPickup(Double v) { s.temperatureAtPickup = v; return this; }
        public Builder notes(String v) { s.notes = v; return this; }
        public Builder checkpoints(List<ShipmentCheckpoint> v) { s.checkpoints = v; return this; }
        public Shipment build() { return s; }
    }

    public Long getId() {
        return id;
    }

    public BloodRequest getBloodRequest() {
        return bloodRequest;
    }

    public ShipmentStatus getStatus() {
        return status;
    }

    public String getCourierName() {
        return courierName;
    }

    public String getCourierPhone() {
        return courierPhone;
    }

    public LocalDateTime getPickedUpAt() {
        return pickedUpAt;
    }

    public LocalDateTime getDeliveredAt() {
        return deliveredAt;
    }

    public Double getTemperatureAtPickup() {
        return temperatureAtPickup;
    }

    public String getNotes() {
        return notes;
    }

    public List<ShipmentCheckpoint> getCheckpoints() {
        return checkpoints;
    }

    public void setBloodRequest(BloodRequest bloodRequest) {
        this.bloodRequest = bloodRequest;
    }

    public void setStatus(ShipmentStatus status) {
        this.status = status;
    }

    public void setCourierName(String courierName) {
        this.courierName = courierName;
    }

    public void setCourierPhone(String courierPhone) {
        this.courierPhone = courierPhone;
    }

    public void setPickedUpAt(LocalDateTime pickedUpAt) {
        this.pickedUpAt = pickedUpAt;
    }

    public void setDeliveredAt(LocalDateTime deliveredAt) {
        this.deliveredAt = deliveredAt;
    }

    public void setTemperatureAtPickup(Double temperatureAtPickup) {
        this.temperatureAtPickup = temperatureAtPickup;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public void setCheckpoints(List<ShipmentCheckpoint> checkpoints) {
        this.checkpoints = checkpoints;
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

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = ShipmentStatus.CREATED;
        }
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

package com.nhutruong.blood.shipment.domain;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@jakarta.persistence.Entity
@org.hibernate.envers.Audited
@Table(name = "shipment_checkpoints")
public class ShipmentCheckpoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "shipment_id")
    private Shipment shipment;

    private String location;
    private String description;
    private LocalDateTime timestamp;
    private Double temperatureReading;

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final ShipmentCheckpoint c = new ShipmentCheckpoint();

        public Builder id(Long v) { c.id = v; return this; }
        public Builder shipment(Shipment v) { c.shipment = v; return this; }
        public Builder location(String v) { c.location = v; return this; }
        public Builder description(String v) { c.description = v; return this; }
        public Builder timestamp(LocalDateTime v) { c.timestamp = v; return this; }
        public Builder temperatureReading(Double v) { c.temperatureReading = v; return this; }
        public ShipmentCheckpoint build() { return c; }
    }

    public Long getId() {
        return id;
    }

    public Shipment getShipment() {
        return shipment;
    }

    public String getLocation() {
        return location;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public Double getTemperatureReading() {
        return temperatureReading;
    }

    public void setShipment(Shipment shipment) {
        this.shipment = shipment;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public void setTemperatureReading(Double temperatureReading) {
        this.temperatureReading = temperatureReading;
    }
}

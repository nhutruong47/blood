package com.nhutruong.blood.shipment.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "shipment_checkpoints")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
}

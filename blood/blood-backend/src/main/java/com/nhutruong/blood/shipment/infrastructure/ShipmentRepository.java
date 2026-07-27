package com.nhutruong.blood.shipment.infrastructure;

import com.nhutruong.blood.shipment.domain.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    List<Shipment> findByBloodRequestId(Long requestId);
    List<Shipment> findByStatus(Shipment.ShipmentStatus status);
}

package com.nhutruong.blood.shipment.infrastructure;

import com.nhutruong.blood.shipment.domain.Shipment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    @EntityGraph(attributePaths = {"bloodRequest", "checkpoints"})
    Optional<Shipment> findWithRelationsById(Long id);

    @EntityGraph(attributePaths = {"bloodRequest", "checkpoints"})
    @Query("SELECT s FROM Shipment s WHERE s.bloodRequest.id = :requestId")
    List<Shipment> findWithRelationsByBloodRequestId(Long requestId);

    @EntityGraph(attributePaths = {"bloodRequest", "checkpoints"})
    List<Shipment> findByBloodRequestId(Long requestId);

    @EntityGraph(attributePaths = {"bloodRequest", "checkpoints"})
    List<Shipment> findByStatus(Shipment.ShipmentStatus status);
}

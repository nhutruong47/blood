package com.nhutruong.blood.inventory.infrastructure;

import com.nhutruong.blood.inventory.domain.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {
}

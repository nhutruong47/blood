package com.nhutruong.blood.repository;

import com.nhutruong.blood.entity.BloodInventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BloodInventoryRepository extends JpaRepository<BloodInventory, Long> {
    Optional<BloodInventory> findByBloodGroup(String bloodGroup);
}

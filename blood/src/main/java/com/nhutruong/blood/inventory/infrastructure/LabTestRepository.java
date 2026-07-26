package com.nhutruong.blood.inventory.infrastructure;

import com.nhutruong.blood.inventory.domain.LabTest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LabTestRepository extends JpaRepository<LabTest, Long> {
}

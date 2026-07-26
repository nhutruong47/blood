package com.nhutruong.blood.inventory.infrastructure;

import com.nhutruong.blood.inventory.domain.BloodComponentType;
import com.nhutruong.blood.inventory.domain.BloodUnit;
import com.nhutruong.blood.inventory.domain.BloodUnitStatus;
import com.nhutruong.blood.shared.domain.BloodGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BloodUnitRepository extends JpaRepository<BloodUnit, Long> {
    boolean existsByBagCode(String bagCode);

    Optional<BloodUnit> findByBagCode(String bagCode);

    List<BloodUnit> findByBloodGroupAndComponentTypeAndStatusAndExpiryDateGreaterThanEqualOrderByExpiryDateAsc(
            BloodGroup bloodGroup,
            BloodComponentType componentType,
            BloodUnitStatus status,
            LocalDate today
    );
}

package com.nhutruong.blood.inventory.infrastructure;

import com.nhutruong.blood.inventory.domain.BloodComponentType;
import com.nhutruong.blood.inventory.domain.BloodUnit;
import com.nhutruong.blood.inventory.domain.BloodUnitStatus;
import com.nhutruong.blood.shared.domain.BloodGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BloodUnitRepository extends JpaRepository<BloodUnit, Long> {
    boolean existsByBagCode(String bagCode);

    Optional<BloodUnit> findByBagCode(String bagCode);

    @org.springframework.cache.annotation.Cacheable(value = "bloodStock", unless = "#result == null or #result.isEmpty()")
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"donor"})
    List<BloodUnit> findByBloodGroupAndComponentTypeAndStatusAndExpiryDateGreaterThanEqualOrderByExpiryDateAsc(
            BloodGroup bloodGroup,
            BloodComponentType componentType,
            BloodUnitStatus status,
            LocalDate today
    );

    @Query("""
        SELECT b.bloodGroup, b.componentType, b.status, COUNT(b), COALESCE(SUM(b.volumeMl), 0)
        FROM BloodUnit b
        GROUP BY b.bloodGroup, b.componentType, b.status
        """)
    List<Object[]> getStockSummary();

    @Query("""
        SELECT b.bloodGroup, b.componentType, b.status, COUNT(b), COALESCE(SUM(b.volumeMl), 0)
        FROM BloodUnit b
        WHERE b.expiryDate >= :today
        GROUP BY b.bloodGroup, b.componentType, b.status
        """)
    List<Object[]> getAvailableStockSummary(@Param("today") LocalDate today);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM BloodUnit b WHERE b.id IN :ids ORDER BY b.expiryDate ASC")
    List<BloodUnit> findByIdInWithLock(@Param("ids") List<Long> ids);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM BloodUnit b WHERE b.bloodGroup IN :groups AND b.status = com.nhutruong.blood.inventory.domain.BloodUnitStatus.AVAILABLE AND b.expiryDate > CURRENT_DATE ORDER BY b.expiryDate ASC")
    List<BloodUnit> findAvailableByBloodGroupsWithLock(@Param("groups") List<BloodGroup> groups);

    List<BloodUnit> findByStatusAndExpiryDateBefore(BloodUnitStatus status, LocalDate date);

    List<BloodUnit> findByReservedForId(Long requestId);

    List<BloodUnit> findByStatusAndUpdatedAtBefore(BloodUnitStatus status, LocalDateTime dateTime);


}

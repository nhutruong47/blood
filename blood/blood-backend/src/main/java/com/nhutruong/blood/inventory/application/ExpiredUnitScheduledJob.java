package com.nhutruong.blood.inventory.application;

import com.nhutruong.blood.inventory.domain.BloodUnit;
import com.nhutruong.blood.inventory.domain.BloodUnitStatus;
import com.nhutruong.blood.inventory.domain.InventoryMovement;
import com.nhutruong.blood.inventory.domain.InventoryMovementType;
import com.nhutruong.blood.inventory.infrastructure.BloodUnitRepository;
import com.nhutruong.blood.inventory.infrastructure.InventoryMovementRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ExpiredUnitScheduledJob {
    private static final Logger log = LoggerFactory.getLogger(ExpiredUnitScheduledJob.class);

    private final BloodUnitRepository bloodUnitRepository;
    private final InventoryMovementRepository movementRepository;
    private final ReservationService reservationService;

    @Value("${app.reservation.ttl-ms:3600000}")
    private long reservationTtlMs;

    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void expireUnits() {
        LocalDate today = LocalDate.now();
        List<BloodUnit> expiredUnits = bloodUnitRepository
                .findByStatusAndExpiryDateBefore(BloodUnitStatus.AVAILABLE, today);

        for (BloodUnit unit : expiredUnits) {
            unit.setStatus(BloodUnitStatus.EXPIRED);
            bloodUnitRepository.save(unit);

            InventoryMovement movement = new InventoryMovement();
            movement.setBloodUnit(unit);
            movement.setType(InventoryMovementType.EXPIRE);
            movement.setFromStatus(BloodUnitStatus.AVAILABLE);
            movement.setToStatus(BloodUnitStatus.EXPIRED);
            movement.setReason("Automatically expired on " + today);
            movementRepository.save(movement);

            log.warn("Blood unit {} expired (expiry: {})", unit.getBagCode(), unit.getExpiryDate());
        }

        if (!expiredUnits.isEmpty()) {
            log.info("Expired {} blood units", expiredUnits.size());
        }
    }

    @Scheduled(
            fixedRateString = "${app.reservation.ttl-ms:3600000}",
            initialDelayString = "${app.reservation.startup-delay-ms:60000}"
    )
    @Transactional
    public void expireStaleReservations() {
        LocalDateTime cutoff = LocalDateTime.now().minusNanos(reservationTtlMs * 1_000_000L);
        List<Long> requestIds = bloodUnitRepository
                .findByStatusAndUpdatedAtBefore(BloodUnitStatus.RESERVED, cutoff)
                .stream()
                .map(BloodUnit::getReservedFor)
                .filter(java.util.Objects::nonNull)
                .map(request -> request.getId())
                .distinct()
                .collect(Collectors.toList());

        for (Long requestId : requestIds) {
            reservationService.releaseReservation(requestId,
                    "Reservation expired after " + reservationTtlMs + " milliseconds");
        }

        if (!requestIds.isEmpty()) {
            log.info("Released stale reservations for {} blood requests", requestIds.size());
        }
    }
}

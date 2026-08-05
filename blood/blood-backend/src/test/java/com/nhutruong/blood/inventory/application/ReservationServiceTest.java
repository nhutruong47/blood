package com.nhutruong.blood.inventory.application;

import com.nhutruong.blood.audit.application.AuditService;
import com.nhutruong.blood.bloodrequest.domain.BloodRequest;
import com.nhutruong.blood.bloodrequest.domain.BloodRequestStatus;
import com.nhutruong.blood.bloodrequest.infrastructure.BloodRequestRepository;
import com.nhutruong.blood.donation.application.BloodCompatibilityService;
import com.nhutruong.blood.inventory.domain.BloodComponentType;
import com.nhutruong.blood.inventory.domain.BloodUnit;
import com.nhutruong.blood.inventory.domain.BloodUnitStatus;
import com.nhutruong.blood.inventory.domain.InventoryMovement;
import com.nhutruong.blood.inventory.infrastructure.BloodUnitRepository;
import com.nhutruong.blood.inventory.infrastructure.InventoryMovementRepository;
import com.nhutruong.blood.shared.domain.BloodGroup;
import com.nhutruong.blood.shared.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock private BloodUnitRepository bloodUnitRepository;
    @Mock private BloodRequestRepository bloodRequestRepository;
    @Mock private InventoryMovementRepository movementRepository;
    @Mock private AuditService auditService;
    @Mock private BloodCompatibilityService bloodCompatibilityService;

    private ReservationService reservationService;

    @BeforeEach
    void setUp() {
        reservationService = new ReservationService(
                bloodUnitRepository,
                bloodRequestRepository,
                movementRepository,
                auditService,
                bloodCompatibilityService
        );
    }

    private BloodUnit makeUnit(Long id, BloodGroup group) {
        BloodUnit unit = new BloodUnit();
        ReflectionTestUtils.setField(unit, "id", id);
        unit.setBagCode("BAG-" + id);
        unit.setBloodGroup(group);
        unit.setComponentType(BloodComponentType.WHOLE_BLOOD);
        unit.setStatus(BloodUnitStatus.AVAILABLE);
        unit.setExpiryDate(LocalDate.now().plusDays(30));
        return unit;
    }

    private BloodRequest makeRequest(Long id, BloodGroup group) {
        BloodRequest req = new BloodRequest();
        ReflectionTestUtils.setField(req, "id", id);
        req.setBloodGroup(group);
        req.setComponentType(BloodComponentType.WHOLE_BLOOD);
        req.setQuantityUnits(2);
        req.setStatus(BloodRequestStatus.APPROVED);
        return req;
    }

    // --- reserve ---

    @Nested
    @DisplayName("reserve")
    class Reserve {

        @Test
        @DisplayName("should reserve compatible blood units successfully")
        void shouldReserveUnitsSuccessfully() {
            BloodRequest request = makeRequest(1L, BloodGroup.A_POSITIVE);
            when(bloodRequestRepository.findById(1L)).thenReturn(Optional.of(request));
            when(bloodCompatibilityService.getCompatibleDonorGroups(BloodGroup.A_POSITIVE))
                    .thenReturn(List.of(BloodGroup.A_POSITIVE, BloodGroup.A_NEGATIVE, BloodGroup.O_POSITIVE, BloodGroup.O_NEGATIVE));

            List<BloodUnit> candidates = List.of(
                    makeUnit(10L, BloodGroup.A_POSITIVE),
                    makeUnit(11L, BloodGroup.A_POSITIVE),
                    makeUnit(12L, BloodGroup.O_POSITIVE)
            );
            when(bloodUnitRepository.findAvailableByBloodGroupsWithLock(any()))
                    .thenReturn(new ArrayList<>(candidates));

            List<BloodUnit> result = reservationService.reserve(1L, BloodGroup.A_POSITIVE, BloodComponentType.WHOLE_BLOOD, 2);

            assertEquals(2, result.size());

            // Verify batch save was called (not individual saves)
            verify(bloodUnitRepository).saveAll(anyList());
            // Verify batch movement save
            verify(movementRepository).saveAll(anyList());

            // Verify audit log
            verify(auditService).log(
                    isNull(), eq("SYSTEM"),
                    eq(com.nhutruong.blood.audit.domain.AuditAction.RESERVE),
                    eq("BloodRequest"), eq("1"),
                    anyString()
            );
        }

        @Test
        @DisplayName("should throw BusinessException when not enough units available")
        void shouldThrowWhenNotEnoughUnits() {
            BloodRequest request = makeRequest(2L, BloodGroup.AB_NEGATIVE);
            when(bloodRequestRepository.findById(2L)).thenReturn(Optional.of(request));
            when(bloodCompatibilityService.getCompatibleDonorGroups(BloodGroup.AB_NEGATIVE))
                    .thenReturn(List.of(BloodGroup.AB_NEGATIVE, BloodGroup.A_NEGATIVE, BloodGroup.B_NEGATIVE, BloodGroup.O_NEGATIVE));

            // Only 1 unit available, need 5
            List<BloodUnit> candidates = List.of(makeUnit(20L, BloodGroup.AB_NEGATIVE));
            when(bloodUnitRepository.findAvailableByBloodGroupsWithLock(any()))
                    .thenReturn(new ArrayList<>(candidates));

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> reservationService.reserve(2L, BloodGroup.AB_NEGATIVE, BloodComponentType.WHOLE_BLOOD, 5));

            assertTrue(ex.getMessage().contains("Not enough compatible units"));
            verify(bloodUnitRepository, never()).saveAll(anyList());
        }

        @Test
        @DisplayName("should throw BusinessException when request not found")
        void shouldThrowWhenRequestNotFound() {
            when(bloodRequestRepository.findById(999L)).thenReturn(Optional.empty());

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> reservationService.reserve(999L, BloodGroup.O_POSITIVE, BloodComponentType.WHOLE_BLOOD, 1));

            assertEquals("Blood request not found", ex.getMessage());
        }

        @Test
        @DisplayName("should filter out expired units")
        void shouldFilterOutExpiredUnits() {
            BloodRequest request = makeRequest(3L, BloodGroup.B_POSITIVE);
            when(bloodRequestRepository.findById(3L)).thenReturn(Optional.of(request));
            when(bloodCompatibilityService.getCompatibleDonorGroups(BloodGroup.B_POSITIVE))
                    .thenReturn(List.of(BloodGroup.B_POSITIVE));

            BloodUnit expiredUnit = makeUnit(30L, BloodGroup.B_POSITIVE);
            expiredUnit.setExpiryDate(LocalDate.now().minusDays(1)); // Expired!

            BloodUnit validUnit = makeUnit(31L, BloodGroup.B_POSITIVE);
            validUnit.setExpiryDate(LocalDate.now().plusDays(30));

            when(bloodUnitRepository.findAvailableByBloodGroupsWithLock(any()))
                    .thenReturn(new ArrayList<>(List.of(expiredUnit, validUnit)));

            List<BloodUnit> result = reservationService.reserve(3L, BloodGroup.B_POSITIVE, BloodComponentType.WHOLE_BLOOD, 1);

            // Only the valid unit should be reserved
            assertEquals(1, result.size());
            assertEquals(31L, result.get(0).getId());
            assertEquals(BloodUnitStatus.RESERVED, result.get(0).getStatus());
        }

        @Test
        @DisplayName("should filter out units with wrong component type")
        void shouldFilterByComponentType() {
            BloodRequest request = makeRequest(4L, BloodGroup.O_POSITIVE);
            request.setComponentType(BloodComponentType.PLASMA);
            when(bloodRequestRepository.findById(4L)).thenReturn(Optional.of(request));
            when(bloodCompatibilityService.getCompatibleDonorGroups(BloodGroup.O_POSITIVE))
                    .thenReturn(List.of(BloodGroup.O_POSITIVE));

            BloodUnit wholeBlood = makeUnit(40L, BloodGroup.O_POSITIVE);
            wholeBlood.setComponentType(BloodComponentType.WHOLE_BLOOD);

            when(bloodUnitRepository.findAvailableByBloodGroupsWithLock(any()))
                    .thenReturn(new ArrayList<>(List.of(wholeBlood)));

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> reservationService.reserve(4L, BloodGroup.O_POSITIVE, BloodComponentType.PLASMA, 1));

            assertTrue(ex.getMessage().contains("Not enough compatible units"));
        }
    }

    // --- releaseReservation ---

    @Nested
    @DisplayName("releaseReservation")
    class ReleaseReservation {

        @Test
        @DisplayName("should release reserved units and set status to AVAILABLE")
        void shouldReleaseUnitsAndSetStatusAvailable() {
            BloodUnit unit1 = makeUnit(100L, BloodGroup.A_POSITIVE);
            unit1.setStatus(BloodUnitStatus.RESERVED);

            BloodUnit unit2 = makeUnit(101L, BloodGroup.A_POSITIVE);
            unit2.setStatus(BloodUnitStatus.RESERVED);

            when(bloodUnitRepository.findByReservedForId(5L)).thenReturn(List.of(unit1, unit2));

            reservationService.releaseReservation(5L, "Request cancelled");

            ArgumentCaptor<List<BloodUnit>> unitsCaptor = ArgumentCaptor.forClass(List.class);
            verify(bloodUnitRepository).saveAll(unitsCaptor.capture());

            List<BloodUnit> savedUnits = unitsCaptor.getValue();
            assertEquals(2, savedUnits.size());
            for (BloodUnit unit : savedUnits) {
                assertEquals(BloodUnitStatus.AVAILABLE, unit.getStatus());
                assertNull(unit.getReservedFor());
            }

            ArgumentCaptor<List<InventoryMovement>> movCaptor = ArgumentCaptor.forClass(List.class);
            verify(movementRepository).saveAll(movCaptor.capture());
            assertEquals(2, movCaptor.getValue().size());
        }

        @Test
        @DisplayName("should not throw when no units are reserved")
        void shouldNotThrowWhenNoUnitsReserved() {
            when(bloodUnitRepository.findByReservedForId(6L)).thenReturn(List.of());

            assertDoesNotThrow(() -> reservationService.releaseReservation(6L, "No units to release"));
            verify(bloodUnitRepository, never()).saveAll(anyList());
            verify(movementRepository, never()).saveAll(anyList());
        }
    }
}

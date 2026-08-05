package com.nhutruong.blood.bloodrequest.application;

import com.nhutruong.blood.bloodrequest.application.dto.BloodRequestResponse;
import com.nhutruong.blood.bloodrequest.application.dto.CreateBloodRequestRequest;
import com.nhutruong.blood.bloodrequest.application.dto.ProcessBloodRequestRequest;
import com.nhutruong.blood.bloodrequest.domain.BloodRequest;
import com.nhutruong.blood.bloodrequest.domain.BloodRequestStatus;
import com.nhutruong.blood.bloodrequest.domain.Urgency;
import com.nhutruong.blood.bloodrequest.infrastructure.BloodRequestRepository;
import com.nhutruong.blood.identity.domain.Role;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.inventory.application.ReservationService;
import com.nhutruong.blood.inventory.domain.BloodComponentType;
import com.nhutruong.blood.inventory.domain.BloodUnit;
import com.nhutruong.blood.shared.domain.BloodGroup;
import com.nhutruong.blood.shared.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BloodRequestServiceTest {

    @Mock private BloodRequestRepository bloodRequestRepository;
    @Mock private ApplicationEventPublisher eventPublisher;
    @Mock private ReservationService reservationService;

    private BloodRequestService bloodRequestService;

    @BeforeEach
    void setUp() {
        bloodRequestService = new BloodRequestService(
                bloodRequestRepository,
                eventPublisher,
                reservationService
        );
    }

    private User makeUser(Long id) {
        User user = new User();
        ReflectionTestUtils.setField(user, "id", id);
        user.setEmail("hospital@example.com");
        user.setRole(Role.HOSPITAL);
        return user;
    }

    private BloodRequest makeRequest(Long id) {
        BloodRequest br = new BloodRequest();
        ReflectionTestUtils.setField(br, "id", id);
        return br;
    }

    // --- createRequest ---

    @Nested
    @DisplayName("createRequest")
    class CreateRequest {

        @Test
        @DisplayName("should create request with SUBMITTED status")
        void shouldCreateRequestWithSubmittedStatus() {
            User hospital = makeUser(1L);
            CreateBloodRequestRequest request = new CreateBloodRequestRequest(
                    BloodGroup.O_POSITIVE, Urgency.ROUTINE,
                    "Patient Nguyen Van A", null, 3, 10.5, 106.7
            );
            when(bloodRequestRepository.save(any(BloodRequest.class))).thenAnswer(inv -> {
                BloodRequest br = inv.getArgument(0);
                ReflectionTestUtils.setField(br, "id", 100L);
                return br;
            });

            BloodRequest result = bloodRequestService.createRequest(request, hospital);

            assertEquals(BloodRequestStatus.SUBMITTED, result.getStatus());
            assertEquals(BloodGroup.O_POSITIVE, result.getBloodGroup());
            assertEquals(Urgency.ROUTINE, result.getUrgency());
            assertEquals("Patient Nguyen Van A", result.getRecipientInfo());
            assertEquals(3, result.getQuantityUnits());
            assertEquals(hospital, result.getMedicalCenter());
        }

        @Test
        @DisplayName("should default component type to WHOLE_BLOOD when null")
        void shouldDefaultComponentTypeToWholeBlood() {
            User hospital = makeUser(1L);
            CreateBloodRequestRequest request = new CreateBloodRequestRequest(
                    BloodGroup.B_POSITIVE, Urgency.URGENT,
                    "Patient B", null, null, null, null
            );
            when(bloodRequestRepository.save(any(BloodRequest.class))).thenAnswer(inv -> {
                BloodRequest br = inv.getArgument(0);
                ReflectionTestUtils.setField(br, "id", 101L);
                return br;
            });

            BloodRequest result = bloodRequestService.createRequest(request, hospital);

            assertEquals(BloodComponentType.WHOLE_BLOOD, result.getComponentType());
            assertEquals(1, result.getQuantityUnits());
        }
    }

    // --- myRequests ---

    @Nested
    @DisplayName("myRequests")
    class MyRequests {

        @Test
        @DisplayName("should return paginated requests for medical center")
        void shouldReturnPaginatedRequests() {
            User hospital = makeUser(2L);
            BloodRequest br1 = makeRequest(10L);
            br1.setBloodGroup(BloodGroup.AB_POSITIVE);
            br1.setStatus(BloodRequestStatus.SUBMITTED);
            br1.setMedicalCenter(hospital);

            Page<BloodRequest> page = new PageImpl<>(List.of(br1));
            when(bloodRequestRepository.findByMedicalCenter(eq(hospital), any())).thenReturn(page);

            Page<BloodRequestResponse> result = bloodRequestService.myRequests(hospital, PageRequest.of(0, 10));

            assertEquals(1, result.getTotalElements());
            assertEquals(BloodGroup.AB_POSITIVE, result.getContent().get(0).getBloodGroup());
        }
    }

    // --- processRequest ---

    @Nested
    @DisplayName("processRequest")
    class ProcessRequest {

        @Test
        @DisplayName("should approve request and auto-reserve units")
        void shouldApproveAndAutoReserve() {
            BloodRequest request = makeRequest(50L);
            request.setBloodGroup(BloodGroup.A_POSITIVE);
            request.setComponentType(BloodComponentType.WHOLE_BLOOD);
            request.setQuantityUnits(2);
            request.setStatus(BloodRequestStatus.SUBMITTED);

            User staff = makeUser(5L);

            BloodUnit unit1 = new BloodUnit();
            ReflectionTestUtils.setField(unit1, "id", 200L);
            unit1.setBagCode("BAG-200");

            BloodUnit unit2 = new BloodUnit();
            ReflectionTestUtils.setField(unit2, "id", 201L);
            unit2.setBagCode("BAG-201");

            when(bloodRequestRepository.findById(50L)).thenReturn(Optional.of(request));
            when(reservationService.reserve(50L, BloodGroup.A_POSITIVE, BloodComponentType.WHOLE_BLOOD, 2))
                    .thenReturn(List.of(unit1, unit2));
            when(bloodRequestRepository.save(any(BloodRequest.class))).thenAnswer(inv -> inv.getArgument(0));

            ProcessBloodRequestRequest input = new ProcessBloodRequestRequest(
                    BloodRequestStatus.APPROVED, "Approved for emergency use"
            );

            BloodRequest result = bloodRequestService.processRequest(50L, input, staff);

            assertEquals(BloodRequestStatus.RESERVED, result.getStatus());
            assertEquals(staff, result.getApprovedBy());
            verify(eventPublisher).publishEvent(any(com.nhutruong.blood.bloodrequest.domain.event.BloodRequestApprovedEvent.class));
        }

        @Test
        @DisplayName("should reject request without attempting reservation")
        void shouldRejectWithoutReservation() {
            BloodRequest request = makeRequest(51L);
            request.setStatus(BloodRequestStatus.SUBMITTED);

            User staff = makeUser(6L);
            when(bloodRequestRepository.findById(51L)).thenReturn(Optional.of(request));
            when(bloodRequestRepository.save(any(BloodRequest.class))).thenAnswer(inv -> inv.getArgument(0));

            ProcessBloodRequestRequest input = new ProcessBloodRequestRequest(
                    BloodRequestStatus.REJECTED, "Insufficient documentation"
            );

            BloodRequest result = bloodRequestService.processRequest(51L, input, staff);

            assertEquals(BloodRequestStatus.REJECTED, result.getStatus());
            assertEquals("Insufficient documentation", result.getStaffResponse());
            verify(reservationService, never()).reserve(anyLong(), any(), any(), anyInt());
        }

        @Test
        @DisplayName("should throw exception when request not found")
        void shouldThrowWhenRequestNotFound() {
            User staff = makeUser(7L);
            when(bloodRequestRepository.findById(999L)).thenReturn(Optional.empty());

            ProcessBloodRequestRequest input = new ProcessBloodRequestRequest(
                    BloodRequestStatus.APPROVED, "OK"
            );

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> bloodRequestService.processRequest(999L, input, staff));

            assertEquals("Request not found", ex.getMessage());
        }

        @Test
        @DisplayName("should throw exception for invalid target status")
        void shouldThrowForInvalidStatus() {
            ProcessBloodRequestRequest input = new ProcessBloodRequestRequest(
                    BloodRequestStatus.RESERVED, "Invalid target"
            );

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> bloodRequestService.processRequest(1L, input, makeUser(1L)));

            assertEquals("Invalid target status. Use APPROVED or REJECTED.", ex.getMessage());
        }

        @Test
        @DisplayName("should throw exception when request already processed")
        void shouldThrowWhenAlreadyProcessed() {
            BloodRequest request = makeRequest(52L);
            request.setStatus(BloodRequestStatus.RESERVED);

            when(bloodRequestRepository.findById(52L)).thenReturn(Optional.of(request));

            ProcessBloodRequestRequest input = new ProcessBloodRequestRequest(
                    BloodRequestStatus.APPROVED, "Already approved"
            );

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> bloodRequestService.processRequest(52L, input, makeUser(8L)));

            assertTrue(ex.getMessage().contains("cannot be processed"));
        }

        @Test
        @DisplayName("should propagate BusinessException from reservation service on approval")
        void shouldPropagateReservationException() {
            BloodRequest request = makeRequest(53L);
            request.setBloodGroup(BloodGroup.AB_NEGATIVE);
            request.setComponentType(BloodComponentType.PLASMA);
            request.setQuantityUnits(10);
            request.setStatus(BloodRequestStatus.SUBMITTED);

            when(bloodRequestRepository.findById(53L)).thenReturn(Optional.of(request));
            when(reservationService.reserve(53L, BloodGroup.AB_NEGATIVE, BloodComponentType.PLASMA, 10))
                    .thenThrow(new BusinessException(null, "Not enough compatible units"));

            ProcessBloodRequestRequest input = new ProcessBloodRequestRequest(
                    BloodRequestStatus.APPROVED, "Auto-reserve"
            );

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> bloodRequestService.processRequest(53L, input, makeUser(9L)));

            assertEquals("Not enough compatible units", ex.getMessage());
        }
    }
}

package com.nhutruong.blood.donation.application;

import com.nhutruong.blood.audit.application.AuditService;
import com.nhutruong.blood.audit.domain.AuditAction;
import com.nhutruong.blood.donation.application.dto.RecordExaminationRequest;
import com.nhutruong.blood.donation.domain.DonationRegistration;
import com.nhutruong.blood.donation.domain.DonationRegistrationStatus;
import com.nhutruong.blood.donation.domain.Examination;
import com.nhutruong.blood.donation.infrastructure.DonationRegistrationRepository;
import com.nhutruong.blood.donation.infrastructure.ExaminationRepository;
import com.nhutruong.blood.identity.domain.Role;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.shared.domain.BloodGroup;
import com.nhutruong.blood.shared.exception.BusinessException;
import com.nhutruong.blood.shared.exception.ErrorCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExaminationServiceTest {

    @Mock
    private ExaminationRepository examinationRepository;

    @Mock
    private DonationRegistrationRepository registrationRepository;

    @Mock
    private AuditService auditService;

    private ExaminationService examinationService;

    @BeforeEach
    void setUp() {
        examinationService = new ExaminationService(
                examinationRepository,
                registrationRepository,
                auditService
        );
    }

    private User createMedicalStaff(Long id) {
        return User.builder()
                .id(id)
                .email("staff" + id + "@hospital.com")
                .firstName("Medical")
                .lastName("Staff")
                .role(Role.MEDICAL_STAFF)
                .build();
    }

    private User createDonor(Long id) {
        return User.builder()
                .id(id)
                .email("donor" + id + "@example.com")
                .firstName("Donor")
                .lastName("User")
                .role(Role.DONOR)
                .build();
    }

    private DonationRegistration createRegistration(Long id, User donor) {
        DonationRegistration reg = new DonationRegistration();
        reg.setId(id);
        reg.setDonor(donor);
        reg.setBloodGroup(BloodGroup.A_POSITIVE);
        reg.setDonationDate(LocalDate.now().plusDays(1));
        reg.setMedicalCenterName("Test Medical Center");
        reg.setWeight(70.0);
        reg.setAge(25);
        reg.setStatus(DonationRegistrationStatus.UNDER_REVIEW);
        return reg;
    }

    @Nested
    @DisplayName("recordVitals tests")
    class RecordVitalsTests {

        @Test
        @DisplayName("Should record vitals for new examination")
        void shouldRecordVitalsForNewExamination() {
            Long registrationId = 1L;
            User medicalStaff = createMedicalStaff(1L);
            User donor = createDonor(2L);
            DonationRegistration registration = createRegistration(registrationId, donor);

            RecordExaminationRequest request = new RecordExaminationRequest(
                    registrationId, 120.0, 80.0, 72.0, 36.6, 14.5, "Donor is in good health"
            );

            when(registrationRepository.findById(registrationId)).thenReturn(Optional.of(registration));
            when(examinationRepository.findByDonationRegistrationId(registrationId)).thenReturn(Optional.empty());
            when(examinationRepository.save(any(Examination.class))).thenAnswer(inv -> inv.getArgument(0));

            Examination result = examinationService.recordVitals(request, medicalStaff);

            assertNotNull(result);
            assertEquals(120.0, result.getBloodPressureSystolic());
            assertEquals(80.0, result.getBloodPressureDiastolic());
            assertEquals(72.0, result.getHeartRate());
            assertEquals(36.6, result.getTemperature());
            assertEquals(14.5, result.getHemoglobinLevel());
            assertEquals("Donor is in good health", result.getHealthNotes());
            assertEquals(medicalStaff, result.getReviewedBy());
            assertNotNull(result.getReviewedAt());
            assertEquals(Examination.ExaminationStatus.NEEDS_DOCTOR_REVIEW, result.getStatus());
        }

        @Test
        @DisplayName("Should update existing examination")
        void shouldUpdateExistingExamination() {
            Long registrationId = 1L;
            User medicalStaff = createMedicalStaff(1L);
            User donor = createDonor(2L);
            DonationRegistration registration = createRegistration(registrationId, donor);

            Examination existingExam = Examination.builder()
                    .donationRegistration(registration)
                    .bloodPressureSystolic(110.0)
                    .build();

            RecordExaminationRequest request = new RecordExaminationRequest(
                    registrationId, 125.0, 82.0, 78.0, 36.8, 14.8, "Updated"
            );

            when(registrationRepository.findById(registrationId)).thenReturn(Optional.of(registration));
            when(examinationRepository.findByDonationRegistrationId(registrationId)).thenReturn(Optional.of(existingExam));
            when(examinationRepository.save(any(Examination.class))).thenAnswer(inv -> inv.getArgument(0));

            Examination result = examinationService.recordVitals(request, medicalStaff);

            assertEquals(125.0, result.getBloodPressureSystolic());
            assertEquals(82.0, result.getBloodPressureDiastolic());
        }

        @Test
        @DisplayName("Should throw exception when registration not found")
        void shouldThrowWhenRegistrationNotFound() {
            Long registrationId = 999L;
            User medicalStaff = createMedicalStaff(1L);

            RecordExaminationRequest request = new RecordExaminationRequest(
                    registrationId, 120.0, 80.0, 72.0, 36.6, 14.5, "Notes"
            );

            when(registrationRepository.findById(registrationId)).thenReturn(Optional.empty());

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> examinationService.recordVitals(request, medicalStaff));

            assertEquals(ErrorCode.NOT_FOUND, ex.errorCode());
            assertEquals("Registration not found", ex.getMessage());
        }
    }

    @Nested
    @DisplayName("approve tests")
    class ApproveTests {

        @Test
        @DisplayName("Should approve examination and update registration status")
        void shouldApproveExaminationAndUpdateRegistrationStatus() {
            Long examinationId = 1L;
            User medicalStaff = createMedicalStaff(1L);
            User donor = createDonor(2L);
            DonationRegistration registration = createRegistration(1L, donor);
            registration.setStatus(DonationRegistrationStatus.UNDER_REVIEW);

            Examination exam = Examination.builder()
                    .donationRegistration(registration)
                    .status(Examination.ExaminationStatus.NEEDS_DOCTOR_REVIEW)
                    .build();

            when(examinationRepository.findById(examinationId)).thenReturn(Optional.of(exam));
            when(examinationRepository.save(any(Examination.class))).thenAnswer(inv -> inv.getArgument(0));
            when(registrationRepository.save(any(DonationRegistration.class))).thenAnswer(inv -> inv.getArgument(0));

            Examination result = examinationService.approve(examinationId, medicalStaff);

            assertEquals(Examination.ExaminationStatus.PASSED, result.getStatus());
            assertEquals(medicalStaff, result.getReviewedBy());
            assertEquals(DonationRegistrationStatus.APPROVED, registration.getStatus());
        }

        @Test
        @DisplayName("Should throw exception when examination not found")
        void shouldThrowWhenExaminationNotFound() {
            Long examinationId = 999L;
            User medicalStaff = createMedicalStaff(1L);

            when(examinationRepository.findById(examinationId)).thenReturn(Optional.empty());

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> examinationService.approve(examinationId, medicalStaff));

            assertEquals(ErrorCode.NOT_FOUND, ex.errorCode());
        }
    }

    @Nested
    @DisplayName("defer tests")
    class DeferTests {

        @Test
        @DisplayName("Should defer examination with reason")
        void shouldDeferExaminationWithReason() {
            Long examinationId = 1L;
            String reason = "Low hemoglobin";
            LocalDateTime nextDate = LocalDateTime.now().plusMonths(1);
            User medicalStaff = createMedicalStaff(1L);
            User donor = createDonor(2L);
            DonationRegistration registration = createRegistration(1L, donor);

            Examination exam = Examination.builder()
                    .donationRegistration(registration)
                    .status(Examination.ExaminationStatus.NEEDS_DOCTOR_REVIEW)
                    .build();

            when(examinationRepository.findById(examinationId)).thenReturn(Optional.of(exam));
            when(examinationRepository.save(any(Examination.class))).thenAnswer(inv -> inv.getArgument(0));
            when(registrationRepository.save(any(DonationRegistration.class))).thenAnswer(inv -> inv.getArgument(0));

            Examination result = examinationService.defer(examinationId, reason, nextDate, medicalStaff);

            assertEquals(Examination.ExaminationStatus.FAILED, result.getStatus());
            assertEquals(reason, result.getDeferralReason());
            assertEquals(nextDate, result.getNextEligibleDate());
            assertEquals(DonationRegistrationStatus.DEFERRED, registration.getStatus());
        }
    }

    @Nested
    @DisplayName("getByRegistration tests")
    class GetByRegistrationTests {

        @Test
        @DisplayName("Should return examination when found")
        void shouldReturnExaminationWhenFound() {
            Long registrationId = 1L;
            User donor = createDonor(2L);
            DonationRegistration registration = createRegistration(registrationId, donor);

            Examination exam = Examination.builder()
                    .donationRegistration(registration)
                    .status(Examination.ExaminationStatus.PASSED)
                    .build();

            when(examinationRepository.findByDonationRegistrationId(registrationId))
                    .thenReturn(Optional.of(exam));

            Examination result = examinationService.getByRegistration(registrationId);

            assertNotNull(result);
            assertEquals(Examination.ExaminationStatus.PASSED, result.getStatus());
        }

        @Test
        @DisplayName("Should return null when not found")
        void shouldReturnNullWhenNotFound() {
            Long registrationId = 999L;

            when(examinationRepository.findByDonationRegistrationId(registrationId))
                    .thenReturn(Optional.empty());

            Examination result = examinationService.getByRegistration(registrationId);

            assertNull(result);
        }
    }
}

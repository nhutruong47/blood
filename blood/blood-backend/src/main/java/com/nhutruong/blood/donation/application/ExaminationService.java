package com.nhutruong.blood.donation.application;

import com.nhutruong.blood.audit.application.AuditService;
import com.nhutruong.blood.audit.domain.AuditAction;
import com.nhutruong.blood.donation.application.dto.RecordExaminationRequest;
import com.nhutruong.blood.donation.domain.DonationRegistration;
import com.nhutruong.blood.donation.domain.DonationRegistrationStatus;
import com.nhutruong.blood.donation.domain.Examination;
import com.nhutruong.blood.donation.infrastructure.DonationRegistrationRepository;
import com.nhutruong.blood.donation.infrastructure.ExaminationRepository;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.shared.exception.BusinessException;
import com.nhutruong.blood.shared.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExaminationService {
    private final ExaminationRepository examinationRepository;
    private final DonationRegistrationRepository registrationRepository;
    private final AuditService auditService;

    @Transactional
    public Examination recordVitals(RecordExaminationRequest request, User medicalStaff) {
        DonationRegistration reg = registrationRepository.findById(request.registrationId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Registration not found"));

        Examination exam = examinationRepository.findByDonationRegistrationId(request.registrationId())
                .orElse(Examination.builder()
                        .donationRegistration(reg)
                        .status(Examination.ExaminationStatus.NEEDS_DOCTOR_REVIEW)
                        .build());

        exam.setBloodPressureSystolic(request.bloodPressureSystolic());
        exam.setBloodPressureDiastolic(request.bloodPressureDiastolic());
        exam.setHeartRate(request.heartRate());
        exam.setTemperature(request.temperature());
        exam.setHemoglobinLevel(request.hemoglobinLevel());
        exam.setHealthNotes(request.healthNotes());
        exam.setReviewedBy(medicalStaff);
        exam.setReviewedAt(LocalDateTime.now());

        Examination saved = examinationRepository.save(exam);
        log.info("Vitals recorded for registration #{} by staff {}", request.registrationId(), medicalStaff.getId());
        return saved;
    }

    @Transactional
    public Examination approve(Long examinationId, User medicalStaff) {
        Examination exam = examinationRepository.findById(examinationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Examination not found"));

        exam.setStatus(Examination.ExaminationStatus.PASSED);
        exam.setReviewedBy(medicalStaff);
        exam.setReviewedAt(LocalDateTime.now());
        examinationRepository.save(exam);

        DonationRegistration reg = exam.getDonationRegistration();
        reg.setStatus(DonationRegistrationStatus.APPROVED);
        registrationRepository.save(reg);

        auditService.log(medicalStaff.getId(), medicalStaff.getRole().name(),
                AuditAction.UPDATE, "Examination",
                String.valueOf(examinationId), "Examination approved, donation approved");

        log.info("Examination #{} approved by staff {}", examinationId, medicalStaff.getId());
        return exam;
    }

    @Transactional
    public Examination defer(Long examinationId, String reason, LocalDateTime nextDate, User medicalStaff) {
        Examination exam = examinationRepository.findById(examinationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Examination not found"));

        exam.setStatus(Examination.ExaminationStatus.FAILED);
        exam.setDeferralReason(reason);
        exam.setNextEligibleDate(nextDate);
        exam.setReviewedBy(medicalStaff);
        exam.setReviewedAt(LocalDateTime.now());
        examinationRepository.save(exam);

        DonationRegistration reg = exam.getDonationRegistration();
        reg.setStatus(DonationRegistrationStatus.DEFERRED);
        registrationRepository.save(reg);

        auditService.log(medicalStaff.getId(), medicalStaff.getRole().name(),
                AuditAction.UPDATE, "Examination",
                String.valueOf(examinationId), "Deferred: " + reason);

        log.info("Examination #{} deferred by staff {}: {}", examinationId, medicalStaff.getId(), reason);
        return exam;
    }

    @Transactional(readOnly = true)
    public Examination getByRegistration(Long registrationId) {
        return examinationRepository.findByDonationRegistrationId(registrationId)
                .orElse(null);
    }
}

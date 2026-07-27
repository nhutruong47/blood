package com.nhutruong.blood.donation.api;

import com.nhutruong.blood.donation.application.ExaminationService;
import com.nhutruong.blood.donation.application.dto.RecordExaminationRequest;
import com.nhutruong.blood.donation.domain.Examination;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.shared.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/examinations")
@PreAuthorize("hasAnyRole('STAFF', 'MEDICALCENTER', 'ADMIN')")
public class ExaminationController {
    private final ExaminationService examinationService;

    public ExaminationController(ExaminationService examinationService) {
        this.examinationService = examinationService;
    }

    @PostMapping("/vitals")
    public ApiResponse<ExaminationResponse> recordVitals(
            @Valid @RequestBody RecordExaminationRequest request,
            @AuthenticationPrincipal User staff
    ) {
        Examination exam = examinationService.recordVitals(request, staff);
        return ApiResponse.success("Vitals recorded", ExaminationResponse.from(exam));
    }

    @PostMapping("/{id}/approve")
    public ApiResponse<ExaminationResponse> approve(
            @PathVariable Long id,
            @AuthenticationPrincipal User staff
    ) {
        Examination exam = examinationService.approve(id, staff);
        return ApiResponse.success("Examination approved", ExaminationResponse.from(exam));
    }

    @PostMapping("/{id}/defer")
    public ApiResponse<ExaminationResponse> defer(
            @PathVariable Long id,
            @RequestParam String reason,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime nextEligibleDate,
            @AuthenticationPrincipal User staff
    ) {
        Examination exam = examinationService.defer(id, reason, nextEligibleDate, staff);
        return ApiResponse.success("Examination deferred", ExaminationResponse.from(exam));
    }

    @GetMapping("/registration/{registrationId}")
    public ApiResponse<ExaminationResponse> getByRegistration(@PathVariable Long registrationId) {
        Examination exam = examinationService.getByRegistration(registrationId);
        if (exam == null) {
            return ApiResponse.failure("No examination found", null);
        }
        return ApiResponse.success(ExaminationResponse.from(exam));
    }

    public record ExaminationResponse(
            Long id,
            Long registrationId,
            String status,
            Double bloodPressureSystolic,
            Double bloodPressureDiastolic,
            Double heartRate,
            Double temperature,
            Double hemoglobinLevel,
            String deferralReason,
            String nextEligibleDate,
            String reviewedBy,
            String reviewedAt,
            String healthNotes
    ) {
        public static ExaminationResponse from(Examination exam) {
            return new ExaminationResponse(
                    exam.getId(),
                    exam.getDonationRegistration() != null ? exam.getDonationRegistration().getId() : null,
                    exam.getStatus() != null ? exam.getStatus().name() : null,
                    exam.getBloodPressureSystolic(),
                    exam.getBloodPressureDiastolic(),
                    exam.getHeartRate(),
                    exam.getTemperature(),
                    exam.getHemoglobinLevel(),
                    exam.getDeferralReason(),
                    exam.getNextEligibleDate() != null ? exam.getNextEligibleDate().toString() : null,
                    exam.getReviewedBy() != null ? exam.getReviewedBy().getEmail() : null,
                    exam.getReviewedAt() != null ? exam.getReviewedAt().toString() : null,
                    exam.getHealthNotes()
            );
        }
    }
}

package com.nhutruong.blood.medicalcenter.api;

import com.nhutruong.blood.donation.domain.DonationRegistration;
import com.nhutruong.blood.donation.domain.DonationRegistrationStatus;
import com.nhutruong.blood.donation.infrastructure.DonationRegistrationRepository;
import com.nhutruong.blood.shared.api.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Read-only endpoints consumed by the medical-center front-end surfaces.
 *
 * Currently exposes:
 *  - GET /api/medical-center/queue/today — the medical-center daily
 *    operations board. For now we filter DonationRegistration rows by the
 *    current date and medical center name; once the Organization linking
 *    lands this filter will use organization_id instead.
 */
@RestController
@RequestMapping("/api/medical-center")
public class MedicalCenterController {

    private final DonationRegistrationRepository registrationRepository;

    public MedicalCenterController(DonationRegistrationRepository registrationRepository) {
        this.registrationRepository = registrationRepository;
    }

    @GetMapping("/queue/today")
    @PreAuthorize("hasAnyRole('MEDICALCENTER','MEDICAL_STAFF','LAB_STAFF','STAFF','ADMIN','SUPER_ADMIN')")
    public ApiResponse<Map<String, Object>> todayQueue(
            @RequestParam(required = false) String medicalCenterName
    ) {
        LocalDate today = LocalDate.now();
        List<DonationRegistration> rows;
        if (medicalCenterName != null && !medicalCenterName.isBlank()) {
            rows = registrationRepository.findAll().stream()
                    .filter(r -> today.equals(r.getDonationDate()))
                    .filter(r -> medicalCenterName.equalsIgnoreCase(
                            r.getMedicalCenterName() == null ? "" : r.getMedicalCenterName()
                    ))
                    .toList();
        } else {
            rows = registrationRepository.findAll().stream()
                    .filter(r -> today.equals(r.getDonationDate()))
                    .toList();
        }

        long total = rows.size();
        long submitted = rows.stream().filter(r -> r.getStatus() == DonationRegistrationStatus.SUBMITTED).count();
        long approved = rows.stream().filter(r -> r.getStatus() == DonationRegistrationStatus.APPROVED).count();
        long deferred = rows.stream().filter(r -> r.getStatus() == DonationRegistrationStatus.DEFERRED).count();
        long completed = rows.stream().filter(r -> r.getStatus() == DonationRegistrationStatus.COMPLETED).count();

        Map<String, Object> payload = Map.of(
                "date", today.toString(),
                "total", total,
                "checkedIn", submitted,
                "approved", approved,
                "deferred", deferred,
                "completed", completed,
                "rows", rows
        );
        return ApiResponse.success(payload);
    }
}
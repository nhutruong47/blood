package com.nhutruong.blood.analytics.api;

import com.nhutruong.blood.bloodrequest.infrastructure.BloodRequestRepository;
import com.nhutruong.blood.donation.infrastructure.DonationRegistrationRepository;
import com.nhutruong.blood.identity.infrastructure.UserRepository;
import com.nhutruong.blood.inventory.infrastructure.BloodUnitRepository;
import com.nhutruong.blood.shared.api.ApiResponse;
import com.nhutruong.blood.shared.domain.BloodGroup;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Lightweight analytics aggregation. The contract is intentionally simple
 * (a single JSON map) so the React analytics page can render without
 * needing a separate endpoint per chart. As the data grows this controller
 * should be split into a dedicated reporting module with materialized
 * projections.
 */
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final UserRepository userRepository;
    private final DonationRegistrationRepository registrationRepository;
    private final BloodUnitRepository bloodUnitRepository;
    private final BloodRequestRepository bloodRequestRepository;

    public AnalyticsController(
            UserRepository userRepository,
            DonationRegistrationRepository registrationRepository,
            BloodUnitRepository bloodUnitRepository,
            BloodRequestRepository bloodRequestRepository
    ) {
        this.userRepository = userRepository;
        this.registrationRepository = registrationRepository;
        this.bloodUnitRepository = bloodUnitRepository;
        this.bloodRequestRepository = bloodRequestRepository;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','STAFF','MEDICAL_STAFF','MEDICALCENTER')")
    public ApiResponse<Map<String, Object>> summary() {
        long totalUsers = userRepository.count();
        long totalDonations = registrationRepository.count();
        long totalBloodUnits = bloodUnitRepository.count();
        long totalRequests = bloodRequestRepository.count();
        long emergencyRequests = bloodRequestRepository.findAll().stream()
                .filter(r -> r.getUrgency() == com.nhutruong.blood.bloodrequest.domain.Urgency.EMERGENCY)
                .count();

        // Blood type distribution: total units per group (any status).
        Map<BloodGroup, Long> byGroup = new EnumMap<>(BloodGroup.class);
        for (BloodGroup g : BloodGroup.values()) {
            byGroup.put(g, 0L);
        }
        bloodUnitRepository.findAll().forEach(unit -> {
            if (unit.getBloodGroup() != null) {
                byGroup.merge(unit.getBloodGroup(), 1L, Long::sum);
            }
        });

        // Last 12 months donations per month (chronological asc).
        Map<String, Long> donationsByMonth = new LinkedHashMap<>();
        LocalDate now = LocalDate.now();
        for (int i = 11; i >= 0; i--) {
            LocalDate target = now.minusMonths(i);
            String key = target.getYear() + "-" + String.format("%02d", target.getMonthValue());
            donationsByMonth.put(key, 0L);
        }
        registrationRepository.findAll().forEach(reg -> {
            if (reg.getDonationDate() == null) return;
            String key = reg.getDonationDate().getYear() + "-"
                    + String.format("%02d", reg.getDonationDate().getMonthValue());
            donationsByMonth.merge(key, 1L, Long::sum);
        });

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("totalUsers", totalUsers);
        payload.put("totalDonations", totalDonations);
        payload.put("totalBloodUnits", totalBloodUnits);
        payload.put("totalRequests", totalRequests);
        payload.put("emergencyRequests", emergencyRequests);
        payload.put("donationsByMonth", donationsByMonth);
        payload.put("bloodTypeDistribution", byGroup);
        payload.put("generatedAt", java.time.Instant.now().toString());

        return ApiResponse.success(payload);
    }

    @GetMapping("/top-centers")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','STAFF','MEDICAL_STAFF','MEDICALCENTER')")
    public ApiResponse<List<Map<String, Object>>> topCenters() {
        Map<String, Long> byCenter = new java.util.HashMap<>();
        registrationRepository.findAll().forEach(reg -> {
            String name = reg.getMedicalCenterName();
            if (name == null || name.isBlank()) return;
            byCenter.merge(name, 1L, Long::sum);
        });
        return ApiResponse.success(byCenter.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(5)
                .map(e -> Map.<String, Object>of("name", e.getKey(), "donations", e.getValue()))
                .toList());
    }
}
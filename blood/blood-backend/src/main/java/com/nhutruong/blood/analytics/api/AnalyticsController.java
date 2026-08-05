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
 * needing a separate endpoint per chart.
 *
 * <p>All aggregations are pushed down to the database using {@code GROUP BY}
 * so we never call {@code findAll().stream()}. The mapper iterates a small
 * result set: 8 blood-group buckets, 12 months, top 5 centers.
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
        long emergencyRequests = bloodRequestRepository.countByUrgency(
                com.nhutruong.blood.bloodrequest.domain.Urgency.EMERGENCY
        );

        // Blood type distribution: pushed down to DB via GROUP BY.
        Map<BloodGroup, Long> byGroup = bloodUnitRepository.countByBloodGroup();
        for (BloodGroup g : BloodGroup.values()) {
            byGroup.putIfAbsent(g, 0L);
        }

        // Last 12 months donations per month (chronological asc).
        Map<String, Long> donationsByMonth = new LinkedHashMap<>();
        LocalDate now = LocalDate.now();
        for (int i = 11; i >= 0; i--) {
            LocalDate target = now.minusMonths(i);
            String key = target.getYear() + "-" + String.format("%02d", target.getMonthValue());
            donationsByMonth.put(key, 0L);
        }
        LocalDate cutoff = now.minusMonths(12);
        for (Object[] row : registrationRepository.donationsByMonthSince(cutoff)) {
            int year = ((Number) row[0]).intValue();
            int month = ((Number) row[1]).intValue();
            long count = ((Number) row[2]).longValue();
            donationsByMonth.put(year + "-" + String.format("%02d", month), count);
        }

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
        List<Object[]> rows = registrationRepository.topCentersByRegistrations(5);
        List<Map<String, Object>> payload = rows.stream()
                .map(row -> Map.<String, Object>of(
                        "name", row[0],
                        "donations", row[1]
                ))
                .toList();
        return ApiResponse.success(payload);
    }
}

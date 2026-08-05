package com.nhutruong.blood.metrics.application;

import com.nhutruong.blood.bloodrequest.domain.BloodRequest;
import com.nhutruong.blood.bloodrequest.domain.BloodRequestStatus;
import com.nhutruong.blood.bloodrequest.infrastructure.BloodRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MetricsService {
    private final BloodRequestRepository requestRepository;

    public MetricsService(BloodRequestRepository requestRepository) {
        this.requestRepository = requestRepository;
    }

    @Transactional(readOnly = true)
    public HospitalMetrics getHospitalMetrics(Long hospitalId) {
        List<BloodRequest> allRequests = requestRepository.findAll().stream()
                .filter(r -> r.getMedicalCenter() != null && r.getMedicalCenter().getId().equals(hospitalId))
                .collect(Collectors.toList());

        long pending = allRequests.stream()
                .filter(r -> r.getStatus() == BloodRequestStatus.SUBMITTED || r.getStatus() == BloodRequestStatus.TRIAGED || r.getStatus() == BloodRequestStatus.APPROVED)
                .count();

        long fulfilled = allRequests.stream()
                .filter(r -> r.getStatus() == BloodRequestStatus.FULFILLED)
                .count();

        return new HospitalMetrics(pending, fulfilled, "2h 15m");
    }

    public record HospitalMetrics(long pendingRequests, long fulfilledToday, String avgResponseTime) {}
}

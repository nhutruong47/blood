package com.nhutruong.blood.matching.api;

import com.nhutruong.blood.bloodrequest.domain.BloodRequest;
import com.nhutruong.blood.bloodrequest.infrastructure.BloodRequestRepository;
import com.nhutruong.blood.matching.application.DonorMatchingService;
import com.nhutruong.blood.matching.domain.DonorMatchRecommendation;
import com.nhutruong.blood.shared.api.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/matching")
public class DonorMatchingController {
    private final DonorMatchingService matchingService;
    private final BloodRequestRepository bloodRequestRepository;

    public DonorMatchingController(DonorMatchingService matchingService, BloodRequestRepository bloodRequestRepository) {
        this.matchingService = matchingService;
        this.bloodRequestRepository = bloodRequestRepository;
    }

    @GetMapping("/recommend/{requestId}")
    public ApiResponse<List<DonorMatchResponse>> recommendDonors(
            @PathVariable Long requestId,
            @RequestParam(defaultValue = "10") int limit
    ) {
        BloodRequest bloodRequest = bloodRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));
        
        List<DonorMatchRecommendation> recommendations = matchingService.recommend(bloodRequest, limit);
        
        List<DonorMatchResponse> response = recommendations.stream().map(r -> new DonorMatchResponse(
                r.getDonor().getId(),
                r.getDonor().getFirstName() + " " + r.getDonor().getLastName(),
                r.getDonor().getBloodGroup() != null ? r.getDonor().getBloodGroup().name() : "UNKNOWN",
                r.getPriorityScore(),
                r.getBloodGroupScore(),
                r.getAvailabilityScore(),
                r.getHealthScore(),
                r.getReason() != null ? r.getReason() : ""
        )).collect(Collectors.toList());

        return ApiResponse.success(response);
    }
}

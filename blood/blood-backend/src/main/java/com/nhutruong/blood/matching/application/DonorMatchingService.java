package com.nhutruong.blood.matching.application;

import com.nhutruong.blood.bloodrequest.domain.BloodRequest;
import com.nhutruong.blood.identity.domain.Role;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.identity.infrastructure.UserRepository;
import com.nhutruong.blood.matching.domain.DonorMatchRecommendation;
import com.nhutruong.blood.matching.infrastructure.DonorMatchRecommendationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class DonorMatchingService {
    private final UserRepository userRepository;
    private final DonorMatchRecommendationRepository recommendationRepository;

    public DonorMatchingService(
            UserRepository userRepository,
            DonorMatchRecommendationRepository recommendationRepository
    ) {
        this.userRepository = userRepository;
        this.recommendationRepository = recommendationRepository;
    }

    @Transactional
    public List<DonorMatchRecommendation> recommend(BloodRequest bloodRequest, int limit) {
        List<DonorMatchRecommendation> recommendations = userRepository
                .findByRoleAndBloodGroup(Role.DONOR, bloodRequest.getBloodGroup())
                .stream()
                .map(donor -> recommendationFor(bloodRequest, donor))
                .sorted(Comparator.comparing(DonorMatchRecommendation::getPriorityScore).reversed())
                .limit(limit)
                .toList();
        return recommendationRepository.saveAll(recommendations);
    }

    private DonorMatchRecommendation recommendationFor(BloodRequest bloodRequest, User donor) {
        int bloodGroupScore = 50;
        int availabilityScore = 20;
        int healthScore = 20;

        DonorMatchRecommendation recommendation = new DonorMatchRecommendation();
        recommendation.setBloodRequest(bloodRequest);
        recommendation.setDonor(donor);
        recommendation.setBloodGroupScore(bloodGroupScore);
        recommendation.setAvailabilityScore(availabilityScore);
        recommendation.setHealthScore(healthScore);
        recommendation.setPriorityScore(bloodGroupScore + availabilityScore + healthScore);
        recommendation.setReason("Exact blood group match; donor profile available for emergency alert");
        return recommendation;
    }
}

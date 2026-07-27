package com.nhutruong.blood.matching.infrastructure;

import com.nhutruong.blood.matching.domain.DonorMatchRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DonorMatchRecommendationRepository extends JpaRepository<DonorMatchRecommendation, Long> {
}

package com.nhutruong.blood.campaign.infrastructure;

import com.nhutruong.blood.campaign.domain.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CampaignRepository extends JpaRepository<Campaign, Long> {
}

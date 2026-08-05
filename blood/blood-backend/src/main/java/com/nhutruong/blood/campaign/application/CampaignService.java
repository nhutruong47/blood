package com.nhutruong.blood.campaign.application;

import com.nhutruong.blood.campaign.domain.Campaign;
import com.nhutruong.blood.campaign.infrastructure.CampaignRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CampaignService {
    private final CampaignRepository campaignRepository;

    public CampaignService(CampaignRepository campaignRepository) {
        this.campaignRepository = campaignRepository;
    }

    public List<Campaign> getAllCampaigns() {
        return campaignRepository.findAll();
    }
}

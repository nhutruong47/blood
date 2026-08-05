package com.nhutruong.blood.campaign.api;

import com.nhutruong.blood.campaign.application.CampaignService;
import com.nhutruong.blood.campaign.domain.Campaign;
import com.nhutruong.blood.shared.api.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/campaigns")
public class CampaignController {
    private final CampaignService campaignService;

    public CampaignController(CampaignService campaignService) {
        this.campaignService = campaignService;
    }

    @GetMapping
    public ApiResponse<List<CampaignResponse>> getAllCampaigns() {
        return ApiResponse.success(
                campaignService.getAllCampaigns().stream()
                        .map(CampaignResponse::from).collect(Collectors.toList())
        );
    }

    public record CampaignResponse(
            Long id,
            String title,
            String description,
            String targetBloodGroup,
            String location,
            LocalDate startDate,
            LocalDate endDate,
            String status
    ) {
        public static CampaignResponse from(Campaign c) {
            return new CampaignResponse(
                    c.getId(), c.getTitle(), c.getDescription(),
                    c.getTargetBloodGroup(), c.getLocation(),
                    c.getStartDate(), c.getEndDate(), c.getStatus()
            );
        }
    }
}

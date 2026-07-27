package com.nhutruong.blood;

import com.nhutruong.blood.donation.domain.DonationLocation;
import com.nhutruong.blood.donation.infrastructure.DonationLocationRepository;
import com.nhutruong.blood.audit.infrastructure.AuditEventRepository;
import com.nhutruong.blood.bloodrequest.infrastructure.BloodRequestRepository;
import com.nhutruong.blood.identity.domain.Role;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.identity.domain.UserStatus;
import com.nhutruong.blood.identity.infrastructure.UserRepository;
import com.nhutruong.blood.inventory.infrastructure.BloodUnitRepository;
import com.nhutruong.blood.inventory.infrastructure.InventoryMovementRepository;
import com.nhutruong.blood.inventory.infrastructure.LabTestRepository;
import com.nhutruong.blood.matching.infrastructure.DonorMatchRecommendationRepository;
import com.nhutruong.blood.notification.infrastructure.NotificationMessageRepository;
import com.nhutruong.blood.organization.infrastructure.OrganizationMemberRepository;
import com.nhutruong.blood.organization.infrastructure.OrganizationRepository;
import com.nhutruong.blood.shared.domain.BloodGroup;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PublicApiSmokeTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DonationLocationRepository locationRepository;

    @Autowired
    private NotificationMessageRepository notificationRepository;

    @Autowired
    private DonorMatchRecommendationRepository recommendationRepository;

    @Autowired
    private InventoryMovementRepository movementRepository;

    @Autowired
    private LabTestRepository labTestRepository;

    @Autowired
    private BloodUnitRepository bloodUnitRepository;

    @Autowired
    private BloodRequestRepository bloodRequestRepository;

    @Autowired
    private OrganizationMemberRepository organizationMemberRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private AuditEventRepository auditEventRepository;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        recommendationRepository.deleteAll();
        movementRepository.deleteAll();
        labTestRepository.deleteAll();
        bloodUnitRepository.deleteAll();
        bloodRequestRepository.deleteAll();
        organizationMemberRepository.deleteAll();
        organizationRepository.deleteAll();
        auditEventRepository.deleteAll();
        locationRepository.deleteAll();
        userRepository.deleteAll();

        User medicalCenter = new User();
        medicalCenter.setEmail("center@example.com");
        medicalCenter.setPassword("password");
        medicalCenter.setFirstName("City");
        medicalCenter.setLastName("Hospital");
        medicalCenter.setBloodGroup(BloodGroup.O_POSITIVE);
        medicalCenter.setRole(Role.MEDICALCENTER);
        medicalCenter.setStatus(UserStatus.ACTIVE);
        medicalCenter = userRepository.save(medicalCenter);

        DonationLocation location = new DonationLocation();
        location.setName("District 1 Blood Donation Center");
        location.setAddress("1 Nguyen Hue, District 1, Ho Chi Minh City");
        location.setLatitude(10.7756587);
        location.setLongitude(106.7004238);
        location.setSlug("district-1-blood-donation-center");
        location.setSeoTitle("District 1 Blood Donation Center");
        location.setSeoDescription("Donate blood at District 1 Blood Donation Center in Ho Chi Minh City.");
        location.setPublished(true);
        location.setCreatedBy(medicalCenter);
        locationRepository.save(location);
    }

    @Test
    void exposesSeoMetadata() throws Exception {
        mockMvc.perform(get("/api/public/seo/metadata"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Blood Donation Management"));
    }

    @Test
    void exposesRobotsTxt() throws Exception {
        mockMvc.perform(get("/robots.txt"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Sitemap:")));
    }

    @Test
    void exposesSitemapXml() throws Exception {
        mockMvc.perform(get("/sitemap.xml"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("<urlset")))
                .andExpect(content().string(containsString("/locations/district-1-blood-donation-center")));
    }

    @Test
    void exposesGeoNearbySearch() throws Exception {
        mockMvc.perform(get("/api/public/locations/nearby?lat=10.762622&lng=106.660172&radiusKm=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].location.slug").value("district-1-blood-donation-center"));
    }

    @Test
    void exposesPublicLocationBySlug() throws Exception {
        mockMvc.perform(get("/api/public/locations/district-1-blood-donation-center"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.latitude").value(10.7756587))
                .andExpect(jsonPath("$.data.longitude").value(106.7004238))
                .andExpect(jsonPath("$.data.seoTitle").value("District 1 Blood Donation Center"));
    }

    @Test
    void checksDonationEligibility() throws Exception {
        String requestBody = """
                {
                  "age": 25,
                  "weightKg": 60,
                  "lastDonationDate": null,
                  "feelingWell": true,
                  "hasFeverOrInfection": false,
                  "recentlyTattooedOrPierced": false,
                  "pregnantOrRecentlyPregnant": false,
                  "takingAntibiotics": false,
                  "hadRecentSurgery": false
                }
                """;

        mockMvc.perform(post("/api/donate/eligibility-check")
                        .contentType("application/json")
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("ELIGIBLE"))
                .andExpect(jsonPath("$.data.canProceedToBooking").value(true));
    }

    @Test
    void exposesBloodCompatibilityEducation() throws Exception {
        mockMvc.perform(get("/api/public/blood-compatibility/O_NEGATIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.bloodGroup").value("O_NEGATIVE"))
                .andExpect(jsonPath("$.data.canDonateTo[0]").value("O_NEGATIVE"))
                .andExpect(jsonPath("$.data.educationNote").value(containsString("emergencies")));
    }
}

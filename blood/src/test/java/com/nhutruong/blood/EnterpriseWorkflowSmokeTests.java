package com.nhutruong.blood;

import com.jayway.jsonpath.JsonPath;
import com.nhutruong.blood.audit.infrastructure.AuditEventRepository;
import com.nhutruong.blood.bloodrequest.infrastructure.BloodRequestRepository;
import com.nhutruong.blood.identity.domain.Role;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.identity.domain.UserStatus;
import com.nhutruong.blood.identity.infrastructure.UserRepository;
import com.nhutruong.blood.inventory.domain.BloodComponentType;
import com.nhutruong.blood.inventory.domain.BloodUnit;
import com.nhutruong.blood.inventory.domain.BloodUnitStatus;
import com.nhutruong.blood.inventory.domain.LabTestResult;
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
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EnterpriseWorkflowSmokeTests {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BloodUnitRepository bloodUnitRepository;

    @Autowired
    private BloodRequestRepository bloodRequestRepository;

    @Autowired
    private InventoryMovementRepository movementRepository;

    @Autowired
    private LabTestRepository labTestRepository;

    @Autowired
    private DonorMatchRecommendationRepository recommendationRepository;

    @Autowired
    private NotificationMessageRepository notificationRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private OrganizationMemberRepository organizationMemberRepository;

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
        userRepository.deleteAll();
    }

    @Test
    void createsAndVerifiesOrganization() throws Exception {
        String body = """
                {
                  "code": "bvcr",
                  "name": "Cho Ray Hospital",
                  "type": "HOSPITAL",
                  "licenseNumber": "MOH-001",
                  "phone": "028000000",
                  "email": "hospital@example.com",
                  "address": "201B Nguyen Chi Thanh, Ho Chi Minh City",
                  "latitude": 10.7553,
                  "longitude": 106.6672
                }
                """;

        String response = mockMvc.perform(post("/api/organizations")
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.code").value("BVCR"))
                .andExpect(jsonPath("$.data.status").value("PENDING_VERIFICATION"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        Integer id = JsonPath.read(response, "$.data.id");
        mockMvc.perform(post("/api/organizations/{id}/verify", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("VERIFIED"));
    }

    @Test
    void releasesBloodUnitAfterPassedLabTestAndExposesStock() throws Exception {
        String createBody = """
                {
                  "bagCode": "bag-001",
                  "bloodGroup": "O_NEGATIVE",
                  "componentType": "RBC",
                  "volumeMl": 350,
                  "collectionDate": "%s",
                  "expiryDate": "%s",
                  "storageLocation": "HCMC-COLD-01"
                }
                """.formatted(LocalDate.now(), LocalDate.now().plusDays(30));

        String response = mockMvc.perform(post("/api/inventory/units")
                        .contentType("application/json")
                        .content(createBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("QUARANTINED"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        Integer unitId = JsonPath.read(response, "$.data.id");
        mockMvc.perform(post("/api/inventory/units/{id}/lab-tests", unitId)
                        .contentType("application/json")
                        .content("""
                                {
                                  "result": "PASSED",
                                  "testType": "INFECTIOUS_DISEASE_SCREENING",
                                  "notes": "All markers negative"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("AVAILABLE"))
                .andExpect(jsonPath("$.data.labTestResult").value("PASSED"));

        mockMvc.perform(get("/api/inventory/stock"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()", greaterThanOrEqualTo(1)));
    }

    @Test
    void emergencyRequestReservesInventoryWhenStockIsAvailable() throws Exception {
        User hospital = saveUser("hospital@example.com", Role.HOSPITAL, BloodGroup.O_NEGATIVE);
        BloodUnit unit = new BloodUnit();
        unit.setBagCode("BAG-RESERVE-001");
        unit.setBloodGroup(BloodGroup.O_NEGATIVE);
        unit.setComponentType(BloodComponentType.RBC);
        unit.setVolumeMl(350);
        unit.setCollectionDate(LocalDate.now());
        unit.setExpiryDate(LocalDate.now().plusDays(14));
        unit.setStorageLocation("HCMC-COLD-01");
        unit.setStatus(BloodUnitStatus.AVAILABLE);
        unit.setLabTestResult(LabTestResult.PASSED);
        bloodUnitRepository.save(unit);

        MockHttpSession session = sessionFor(hospital);
        mockMvc.perform(post("/api/emergency-requests")
                        .session(session)
                        .contentType("application/json")
                        .content("""
                                {
                                  "bloodGroup": "O_NEGATIVE",
                                  "componentType": "RBC",
                                  "quantityUnits": 1,
                                  "recipientInfo": "ER patient #A1",
                                  "latitude": 10.7553,
                                  "longitude": 106.6672
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("RESERVED"))
                .andExpect(jsonPath("$.data.reservedUnits").value(1));
    }

    @Test
    void emergencyRequestStartsDonorMatchingWhenInventoryIsShort() throws Exception {
        User hospital = saveUser("hospital2@example.com", Role.HOSPITAL, BloodGroup.O_POSITIVE);
        saveUser("donor@example.com", Role.DONOR, BloodGroup.O_POSITIVE);

        MockHttpSession session = sessionFor(hospital);
        mockMvc.perform(post("/api/emergency-requests")
                        .session(session)
                        .contentType("application/json")
                        .content("""
                                {
                                  "bloodGroup": "O_POSITIVE",
                                  "componentType": "RBC",
                                  "quantityUnits": 2,
                                  "recipientInfo": "ER patient #B1",
                                  "latitude": 10.7553,
                                  "longitude": 106.6672
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("MATCHING_DONOR"))
                .andExpect(jsonPath("$.data.recommendedDonors").value(1))
                .andExpect(jsonPath("$.data.notificationsQueued").value(1));
    }

    private User saveUser(String email, Role role, BloodGroup bloodGroup) {
        User user = new User();
        user.setEmail(email);
        user.setPassword("password");
        user.setFirstName("Test");
        user.setLastName(role.name());
        user.setBloodGroup(bloodGroup);
        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);
        return userRepository.save(user);
    }

    private MockHttpSession sessionFor(User user) {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("currentUser", user);
        return session;
    }
}

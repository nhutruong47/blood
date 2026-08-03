package com.nhutruong.blood;

import com.nhutruong.blood.dto.BloodRequestCreateRequest;
import com.nhutruong.blood.dto.BloodRequestDecisionRequest;
import com.nhutruong.blood.dto.DonationDecisionRequest;
import com.nhutruong.blood.dto.DonationRegistrationRequest;
import com.nhutruong.blood.entity.Role;
import com.nhutruong.blood.entity.User;
import com.nhutruong.blood.enums.BloodInventoryTransactionType;
import com.nhutruong.blood.enums.BloodRequestStatus;
import com.nhutruong.blood.enums.DonationRegistrationStatus;
import com.nhutruong.blood.enums.UrgencyLevel;
import com.nhutruong.blood.enums.UserStatus;
import com.nhutruong.blood.exception.BusinessRuleException;
import com.nhutruong.blood.repository.BloodInventoryRepository;
import com.nhutruong.blood.repository.BloodInventoryTransactionRepository;
import com.nhutruong.blood.repository.UserRepository;
import com.nhutruong.blood.service.imple.BloodRequestServiceImple;
import com.nhutruong.blood.service.imple.DonationServiceImple;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ActiveProfiles("test")
@SpringBootTest
@Transactional
class WorkflowServiceTests {

    @Autowired
    private DonationServiceImple donationService;

    @Autowired
    private BloodRequestServiceImple bloodRequestService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BloodInventoryRepository inventoryRepository;

    @Autowired
    private BloodInventoryTransactionRepository transactionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void donationCompleteIncreasesInventoryOnlyOnce() {
        User donor = user("donor-workflow@example.com", Role.DONOR);
        User staff = user("staff-workflow@example.com", Role.STAFF);

        var registration = donationService.registerDonation(new DonationRegistrationRequest(
                "Center A",
                LocalDate.now(),
                "O+",
                "Healthy",
                25,
                60,
                250
        ), donor);

        donationService.approve(registration.getId(), new DonationDecisionRequest("Eligible"), staff);
        var completed = donationService.complete(registration.getId(), new DonationDecisionRequest("Collected"), staff);

        assertThat(completed.getStatus()).isEqualTo(DonationRegistrationStatus.COMPLETED);
        assertThat(inventoryRepository.findByBloodGroup("O+").orElseThrow().getAvailableAmount()).isEqualTo(250);
        assertThat(transactionRepository.existsByTransactionTypeAndReferenceTypeAndReferenceId(
                BloodInventoryTransactionType.DONATION_IN,
                "DonationRegistration",
                registration.getId()
        )).isTrue();
    }

    @Test
    void fulfilledRequestDecreasesInventoryAndCompletesRequest() {
        User donor = user("donor-inventory@example.com", Role.DONOR);
        User staff = user("staff-inventory@example.com", Role.STAFF);
        User center = user("center-inventory@example.com", Role.MEDICALCENTER);

        var registration = donationService.registerDonation(new DonationRegistrationRequest(
                "Center B",
                LocalDate.now(),
                "O-",
                "Healthy",
                28,
                65,
                300
        ), donor);
        donationService.approve(registration.getId(), new DonationDecisionRequest("Eligible"), staff);
        donationService.complete(registration.getId(), new DonationDecisionRequest("Collected"), staff);

        var request = bloodRequestService.createRequest(new BloodRequestCreateRequest("O+", UrgencyLevel.HIGH, "Recipient", 200), center);
        bloodRequestService.approve(request.getId(), new BloodRequestDecisionRequest("Approved", null, null), staff);
        var fulfilled = bloodRequestService.fulfill(request.getId(), new BloodRequestDecisionRequest("Issued", null, "O-"), staff);

        assertThat(fulfilled.getStatus()).isEqualTo(BloodRequestStatus.FULFILLED);
        assertThat(fulfilled.getFulfilledBloodGroup()).isEqualTo("O-");
        assertThat(inventoryRepository.findByBloodGroup("O-").orElseThrow().getAvailableAmount()).isEqualTo(100);
    }

    @Test
    void inventoryCannotGoNegative() {
        User staff = user("staff-negative@example.com", Role.STAFF);
        User center = user("center-negative@example.com", Role.MEDICALCENTER);

        var request = bloodRequestService.createRequest(new BloodRequestCreateRequest("AB+", UrgencyLevel.EMERGENCY, "Recipient", 100), center);
        bloodRequestService.approve(request.getId(), new BloodRequestDecisionRequest("Approved", null, null), staff);

        assertThatThrownBy(() -> bloodRequestService.fulfill(request.getId(), new BloodRequestDecisionRequest("Issued", null, null), staff))
                .isInstanceOf(BusinessRuleException.class);
    }

    private User user(String email, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("Password123"));
        user.setFirstName("Test");
        user.setLastName("User");
        user.setBloodGroup("O+");
        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);
        return userRepository.save(user);
    }
}

package com.nhutruong.blood.service.imple;

import com.nhutruong.blood.dto.DonationDecisionRequest;
import com.nhutruong.blood.dto.DonationRegistrationRequest;
import com.nhutruong.blood.entity.DonationRegistration;
import com.nhutruong.blood.entity.User;
import com.nhutruong.blood.enums.DonationRegistrationStatus;
import com.nhutruong.blood.exception.BusinessRuleException;
import com.nhutruong.blood.exception.ForbiddenException;
import com.nhutruong.blood.exception.ResourceNotFoundException;
import com.nhutruong.blood.repository.DonationRegistrationRepository;
import com.nhutruong.blood.service.AuditLogService;
import com.nhutruong.blood.service.BloodCompatibilityService;
import com.nhutruong.blood.service.BloodInventoryService;
import com.nhutruong.blood.service.DonationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DonationServiceImple implements DonationService {

    private static final int MIN_DONATION_AMOUNT = 100;
    private static final int MAX_DONATION_AMOUNT = 650;

    private final DonationRegistrationRepository donationRepo;
    private final BloodCompatibilityService compatibilityService;
    private final BloodInventoryService inventoryService;
    private final AuditLogService auditLogService;

    public DonationServiceImple(
            DonationRegistrationRepository donationRepo,
            BloodCompatibilityService compatibilityService,
            BloodInventoryService inventoryService,
            AuditLogService auditLogService
    ) {
        this.donationRepo = donationRepo;
        this.compatibilityService = compatibilityService;
        this.inventoryService = inventoryService;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional
    public DonationRegistration registerDonation(DonationRegistrationRequest request, User donor) {
        validateDonationRules(request);

        DonationRegistration registration = new DonationRegistration();
        registration.setMedicalCenter(request.medicalCenter());
        registration.setDonationDate(request.donationDate());
        registration.setBloodGroup(request.bloodGroup());
        registration.setHealthStatus(request.healthStatus());
        registration.setWeight(request.weight());
        registration.setAmount(request.amount());
        registration.setAge(request.age());
        registration.setDonor(donor);
        registration.setStatus(DonationRegistrationStatus.PENDING);
        registration.setApproved(false);
        return donationRepo.save(registration);
    }

    @Override
    public List<DonationRegistration> myRegistrations(User donor) {
        return donationRepo.findByDonor(donor);
    }

    @Override
    public DonationRegistration myRegistration(Long id, User donor) {
        DonationRegistration registration = getDonation(id);
        if (registration.getDonor() == null || !registration.getDonor().getId().equals(donor.getId())) {
            throw new ForbiddenException("Donation registration does not belong to current donor");
        }
        return registration;
    }

    @Override
    public List<DonationRegistration> staffDonations() {
        return donationRepo.findAll();
    }

    @Override
    @Transactional
    public DonationRegistration approve(Long id, DonationDecisionRequest request, User staff) {
        DonationRegistration registration = getDonation(id);
        requireStatus(registration, DonationRegistrationStatus.PENDING);
        DonationRegistrationStatus oldStatus = registration.getStatus();

        registration.setStatus(DonationRegistrationStatus.APPROVED);
        registration.setApproved(true);
        registration.setApprovedBy(staff);
        registration.setApprovedAt(LocalDateTime.now());
        registration.setDecisionReason(request == null ? null : request.reason());
        DonationRegistration saved = donationRepo.save(registration);
        auditLogService.record(staff, "DONATION_APPROVE", "DonationRegistration", id, oldStatus.name(), saved.getStatus().name());
        return saved;
    }

    @Override
    @Transactional
    public DonationRegistration reject(Long id, DonationDecisionRequest request, User staff) {
        if (request == null || request.reason() == null || request.reason().isBlank()) {
            throw new BusinessRuleException("Reject reason is required");
        }

        DonationRegistration registration = getDonation(id);
        requireStatus(registration, DonationRegistrationStatus.PENDING);
        DonationRegistrationStatus oldStatus = registration.getStatus();

        registration.setStatus(DonationRegistrationStatus.REJECTED);
        registration.setApproved(false);
        registration.setRejectedBy(staff);
        registration.setRejectedAt(LocalDateTime.now());
        registration.setDecisionReason(request.reason());
        DonationRegistration saved = donationRepo.save(registration);
        auditLogService.record(staff, "DONATION_REJECT", "DonationRegistration", id, oldStatus.name(), saved.getStatus().name());
        return saved;
    }

    @Override
    @Transactional
    public DonationRegistration complete(Long id, DonationDecisionRequest request, User staff) {
        DonationRegistration registration = getDonation(id);
        requireStatus(registration, DonationRegistrationStatus.APPROVED);
        DonationRegistrationStatus oldStatus = registration.getStatus();

        registration.setStatus(DonationRegistrationStatus.COMPLETED);
        registration.setCompletedBy(staff);
        registration.setCompletedAt(LocalDateTime.now());
        registration.setDecisionReason(request == null ? registration.getDecisionReason() : request.reason());

        if (!registration.isInventoryRecorded()) {
            inventoryService.recordDonationIn(registration.getBloodGroup(), registration.getAmount(), registration.getId(), staff);
            registration.setInventoryRecorded(true);
        }

        DonationRegistration saved = donationRepo.save(registration);
        auditLogService.record(staff, "DONATION_COMPLETE", "DonationRegistration", id, oldStatus.name(), saved.getStatus().name());
        return saved;
    }

    private DonationRegistration getDonation(Long id) {
        return donationRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation registration not found"));
    }

    private void requireStatus(DonationRegistration registration, DonationRegistrationStatus expected) {
        if (registration.getStatus() != expected) {
            throw new BusinessRuleException("Invalid donation status transition from " + registration.getStatus());
        }
    }

    private void validateDonationRules(DonationRegistrationRequest request) {
        if (!compatibilityService.isValidBloodGroup(request.bloodGroup())) {
            throw new BusinessRuleException("Invalid blood group");
        }
        if (request.amount() < MIN_DONATION_AMOUNT || request.amount() > MAX_DONATION_AMOUNT) {
            throw new BusinessRuleException("Donation amount must be between " + MIN_DONATION_AMOUNT + " and " + MAX_DONATION_AMOUNT);
        }
    }
}

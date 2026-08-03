package com.nhutruong.blood.service.imple;

import com.nhutruong.blood.dto.BloodRequestCreateRequest;
import com.nhutruong.blood.dto.BloodRequestDecisionRequest;
import com.nhutruong.blood.entity.BloodRequest;
import com.nhutruong.blood.entity.User;
import com.nhutruong.blood.enums.BloodRequestStatus;
import com.nhutruong.blood.exception.BusinessRuleException;
import com.nhutruong.blood.exception.ResourceNotFoundException;
import com.nhutruong.blood.repository.BloodRequestRepository;
import com.nhutruong.blood.service.AuditLogService;
import com.nhutruong.blood.service.BloodCompatibilityService;
import com.nhutruong.blood.service.BloodInventoryService;
import com.nhutruong.blood.service.BloodRequestService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BloodRequestServiceImple implements BloodRequestService {

    private final BloodRequestRepository repository;
    private final BloodCompatibilityService compatibilityService;
    private final BloodInventoryService inventoryService;
    private final AuditLogService auditLogService;

    public BloodRequestServiceImple(
            BloodRequestRepository repository,
            BloodCompatibilityService compatibilityService,
            BloodInventoryService inventoryService,
            AuditLogService auditLogService
    ) {
        this.repository = repository;
        this.compatibilityService = compatibilityService;
        this.inventoryService = inventoryService;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional
    public BloodRequest createRequest(BloodRequestCreateRequest request, User medicalCenter) {
        if (!compatibilityService.isValidBloodGroup(request.bloodGroup())) {
            throw new BusinessRuleException("Invalid blood group");
        }

        BloodRequest entity = new BloodRequest();
        entity.setBloodGroup(request.bloodGroup());
        entity.setUrgency(request.urgency());
        entity.setRecipientInfo(request.recipientInfo());
        entity.setAmount(request.amount());
        entity.setMedicalCenter(medicalCenter);
        entity.setStatus(BloodRequestStatus.PENDING);
        return repository.save(entity);
    }

    @Override
    public List<BloodRequest> myRequests(User medicalCenter) {
        return repository.findByMedicalCenter(medicalCenter);
    }

    @Override
    public List<BloodRequest> pendingRequests() {
        return repository.findByStatus(BloodRequestStatus.PENDING);
    }

    @Override
    @Transactional
    public BloodRequest approve(Long id, BloodRequestDecisionRequest request, User staff) {
        BloodRequest bloodRequest = getRequest(id);
        requireStatus(bloodRequest, BloodRequestStatus.PENDING);
        BloodRequestStatus oldStatus = bloodRequest.getStatus();

        bloodRequest.setStatus(BloodRequestStatus.APPROVED);
        bloodRequest.setApprovedBy(staff);
        bloodRequest.setProcessedBy(staff);
        bloodRequest.setProcessedAt(LocalDateTime.now());
        bloodRequest.setStaffResponse(request == null ? null : request.response());
        BloodRequest saved = repository.save(bloodRequest);
        auditLogService.record(staff, "BLOOD_REQUEST_APPROVE", "BloodRequest", id, oldStatus.name(), saved.getStatus().name());
        return saved;
    }

    @Override
    @Transactional
    public BloodRequest reject(Long id, BloodRequestDecisionRequest request, User staff) {
        if (request == null || request.rejectionReason() == null || request.rejectionReason().isBlank()) {
            throw new BusinessRuleException("Rejection reason is required");
        }

        BloodRequest bloodRequest = getRequest(id);
        requireStatus(bloodRequest, BloodRequestStatus.PENDING);
        BloodRequestStatus oldStatus = bloodRequest.getStatus();

        bloodRequest.setStatus(BloodRequestStatus.REJECTED);
        bloodRequest.setProcessedBy(staff);
        bloodRequest.setProcessedAt(LocalDateTime.now());
        bloodRequest.setStaffResponse(request.response());
        bloodRequest.setRejectionReason(request.rejectionReason());
        BloodRequest saved = repository.save(bloodRequest);
        auditLogService.record(staff, "BLOOD_REQUEST_REJECT", "BloodRequest", id, oldStatus.name(), saved.getStatus().name());
        return saved;
    }

    @Override
    @Transactional
    public BloodRequest fulfill(Long id, BloodRequestDecisionRequest request, User staff) {
        BloodRequest bloodRequest = getRequest(id);
        if (bloodRequest.getStatus() == BloodRequestStatus.FULFILLED) {
            return bloodRequest;
        }
        if (bloodRequest.getStatus() != BloodRequestStatus.APPROVED && bloodRequest.getStatus() != BloodRequestStatus.PROCESSING) {
            throw new BusinessRuleException("Blood request must be APPROVED or PROCESSING before fulfillment");
        }

        String selectedBloodGroup = request == null || request.bloodGroup() == null || request.bloodGroup().isBlank()
                ? inventoryService.selectBloodGroupForFulfillment(bloodRequest.getBloodGroup(), bloodRequest.getAmount())
                : request.bloodGroup();
        if (!compatibilityService.isCompatible(selectedBloodGroup, bloodRequest.getBloodGroup())) {
            throw new BusinessRuleException("Selected blood group is not compatible with request");
        }

        BloodRequestStatus oldStatus = bloodRequest.getStatus();
        inventoryService.fulfillRequestOut(selectedBloodGroup, bloodRequest.getAmount(), bloodRequest.getId(), staff);
        bloodRequest.setStatus(BloodRequestStatus.FULFILLED);
        bloodRequest.setProcessedBy(staff);
        bloodRequest.setProcessedAt(LocalDateTime.now());
        bloodRequest.setFulfilledAt(LocalDateTime.now());
        bloodRequest.setFulfilledBloodGroup(selectedBloodGroup);
        bloodRequest.setStaffResponse(request == null ? bloodRequest.getStaffResponse() : request.response());
        BloodRequest saved = repository.save(bloodRequest);
        auditLogService.record(staff, "BLOOD_REQUEST_FULFILL", "BloodRequest", id, oldStatus.name(), saved.getStatus().name());
        return saved;
    }

    private BloodRequest getRequest(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blood request not found"));
    }

    private void requireStatus(BloodRequest bloodRequest, BloodRequestStatus expected) {
        if (bloodRequest.getStatus() != expected) {
            throw new BusinessRuleException("Invalid blood request status transition from " + bloodRequest.getStatus());
        }
    }
}

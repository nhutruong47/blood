package com.nhutruong.blood.bloodrequest.application;

import com.nhutruong.blood.bloodrequest.application.dto.CreateBloodRequestRequest;
import com.nhutruong.blood.bloodrequest.application.dto.ProcessBloodRequestRequest;
import com.nhutruong.blood.bloodrequest.domain.BloodRequest;
import com.nhutruong.blood.bloodrequest.domain.BloodRequestStatus;
import com.nhutruong.blood.bloodrequest.infrastructure.BloodRequestRepository;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.inventory.domain.BloodComponentType;
import com.nhutruong.blood.shared.exception.BusinessException;
import com.nhutruong.blood.shared.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
public class BloodRequestService {
    private static final Set<BloodRequestStatus> STAFF_DECISIONS = Set.of(
            BloodRequestStatus.APPROVED,
            BloodRequestStatus.REJECTED
    );

    private final BloodRequestRepository bloodRequestRepository;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    public BloodRequestService(BloodRequestRepository bloodRequestRepository, org.springframework.context.ApplicationEventPublisher eventPublisher) {
        this.bloodRequestRepository = bloodRequestRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public BloodRequest createRequest(CreateBloodRequestRequest request, User medicalCenter) {
        BloodRequest bloodRequest = new BloodRequest();
        bloodRequest.setBloodGroup(request.bloodGroup());
        bloodRequest.setUrgency(request.urgency());
        bloodRequest.setRecipientInfo(request.recipientInfo().trim());
        bloodRequest.setComponentType(request.componentType() == null ? BloodComponentType.WHOLE_BLOOD : request.componentType());
        bloodRequest.setQuantityUnits(request.quantityUnits() == null ? 1 : request.quantityUnits());
        bloodRequest.setLatitude(request.latitude());
        bloodRequest.setLongitude(request.longitude());
        bloodRequest.setMedicalCenter(medicalCenter);
        bloodRequest.setStatus(BloodRequestStatus.SUBMITTED);
        return bloodRequestRepository.save(bloodRequest);
    }

    @Transactional(readOnly = true)
    public List<BloodRequest> myRequests(User medicalCenter) {
        return bloodRequestRepository.findByMedicalCenter(medicalCenter);
    }

    @Transactional(readOnly = true)
    public List<BloodRequest> pendingRequests() {
        return bloodRequestRepository.findByStatus(BloodRequestStatus.SUBMITTED);
    }

    @Transactional
    public BloodRequest processRequest(Long id, ProcessBloodRequestRequest request, User staff) {
        if (!STAFF_DECISIONS.contains(request.status())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Staff decision must be APPROVED or REJECTED");
        }

        BloodRequest bloodRequest = bloodRequestRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Blood request not found"));

        if (bloodRequest.getStatus() != BloodRequestStatus.SUBMITTED
                && bloodRequest.getStatus() != BloodRequestStatus.TRIAGED) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Blood request is already processed");
        }

        bloodRequest.setStatus(request.status());
        bloodRequest.setStaffResponse(request.response());
        bloodRequest.setApprovedBy(staff);

        BloodRequest savedRequest = bloodRequestRepository.save(bloodRequest);

        if (savedRequest.getStatus() == BloodRequestStatus.APPROVED) {
            eventPublisher.publishEvent(new com.nhutruong.blood.bloodrequest.domain.event.BloodRequestApprovedEvent(savedRequest));
        }

        return savedRequest;
    }
}

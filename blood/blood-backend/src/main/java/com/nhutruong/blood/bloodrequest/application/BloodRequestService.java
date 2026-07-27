package com.nhutruong.blood.bloodrequest.application;

import com.nhutruong.blood.bloodrequest.application.dto.BloodRequestResponse;
import com.nhutruong.blood.bloodrequest.application.dto.CreateBloodRequestRequest;
import com.nhutruong.blood.bloodrequest.application.dto.ProcessBloodRequestRequest;
import com.nhutruong.blood.bloodrequest.domain.BloodRequest;
import com.nhutruong.blood.bloodrequest.domain.BloodRequestStatus;
import com.nhutruong.blood.bloodrequest.domain.event.BloodRequestApprovedEvent;
import com.nhutruong.blood.bloodrequest.infrastructure.BloodRequestRepository;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.inventory.application.ReservationService;
import com.nhutruong.blood.inventory.domain.BloodComponentType;
import com.nhutruong.blood.shared.exception.BusinessException;
import com.nhutruong.blood.shared.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Slf4j
@Service
public class BloodRequestService {
    private static final Set<BloodRequestStatus> STAFF_DECISIONS = Set.of(
            BloodRequestStatus.APPROVED,
            BloodRequestStatus.REJECTED
    );

    private final BloodRequestRepository bloodRequestRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final ReservationService reservationService;

    public BloodRequestService(
            BloodRequestRepository bloodRequestRepository,
            ApplicationEventPublisher eventPublisher,
            ReservationService reservationService
    ) {
        this.bloodRequestRepository = bloodRequestRepository;
        this.eventPublisher = eventPublisher;
        this.reservationService = reservationService;
    }

    @Transactional
    public BloodRequest createRequest(CreateBloodRequestRequest request, User medicalCenter) {
        BloodRequest bloodRequest = new BloodRequest();
        bloodRequest.setBloodGroup(request.bloodGroup());
        bloodRequest.setUrgency(request.urgency());
        bloodRequest.setRecipientInfo(request.recipientInfo().trim());
        bloodRequest.setComponentType(request.componentType() == null
                ? BloodComponentType.WHOLE_BLOOD : request.componentType());
        bloodRequest.setQuantityUnits(request.quantityUnits() == null ? 1 : request.quantityUnits());
        bloodRequest.setLatitude(request.latitude());
        bloodRequest.setLongitude(request.longitude());
        bloodRequest.setMedicalCenter(medicalCenter);
        bloodRequest.setStatus(BloodRequestStatus.SUBMITTED);
        return bloodRequestRepository.save(bloodRequest);
    }

    @Transactional(readOnly = true)
    public Page<BloodRequestResponse> myRequests(User medicalCenter, Pageable pageable) {
        return bloodRequestRepository.findByMedicalCenter(medicalCenter, pageable)
                .map(BloodRequestResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<BloodRequestResponse> pendingRequests(Pageable pageable) {
        return bloodRequestRepository.findPendingRequestsPageable(BloodRequestStatus.SUBMITTED, pageable)
                .map(BloodRequestResponse::from);
    }

    @Transactional
    public BloodRequest processRequest(Long requestId, ProcessBloodRequestRequest input, User staff) {
        if (!STAFF_DECISIONS.contains(input.status())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Invalid target status. Use APPROVED or REJECTED.");
        }

        BloodRequest request = bloodRequestRepository.findById(requestId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Request not found"));
        if (request.getStatus() != BloodRequestStatus.SUBMITTED
                && request.getStatus() != BloodRequestStatus.TRIAGED) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Request cannot be processed in status: " + request.getStatus());
        }

        request.setStaffResponse(input.response());
        request.setApprovedBy(staff);
        if (input.status() == BloodRequestStatus.REJECTED) {
            request.setStatus(BloodRequestStatus.REJECTED);
        } else {
            request.setStatus(BloodRequestStatus.APPROVED);
            try {
                var reserved = reservationService.reserve(
                        requestId,
                        request.getBloodGroup(),
                        request.getComponentType(),
                        request.getQuantityUnits()
                );
                request.setStatus(BloodRequestStatus.RESERVED);
                log.info("Auto-reserved {} units for request #{}", reserved.size(), requestId);
            } catch (BusinessException exception) {
                log.warn("Could not auto-reserve for request #{}: {}", requestId, exception.getMessage());
            }
        }

        BloodRequest saved = bloodRequestRepository.save(request);
        eventPublisher.publishEvent(new BloodRequestApprovedEvent(saved));
        return saved;
    }
}

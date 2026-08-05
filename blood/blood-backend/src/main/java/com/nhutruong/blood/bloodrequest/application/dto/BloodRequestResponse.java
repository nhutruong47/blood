package com.nhutruong.blood.bloodrequest.application.dto;

import com.nhutruong.blood.bloodrequest.domain.BloodRequest;
import com.nhutruong.blood.bloodrequest.domain.BloodRequestStatus;
import com.nhutruong.blood.bloodrequest.domain.Urgency;
import com.nhutruong.blood.inventory.domain.BloodComponentType;
import com.nhutruong.blood.shared.domain.BloodGroup;

import java.time.LocalDateTime;

public class BloodRequestResponse {
    private final Long id;
    private final BloodGroup bloodGroup;
    private final Urgency urgency;
    private final String recipientInfo;
    private final BloodComponentType componentType;
    private final Integer quantityUnits;
    private final Double latitude;
    private final Double longitude;
    private final Long medicalCenterId;
    private final BloodRequestStatus status;
    private final String staffResponse;
    private final Long approvedById;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public BloodRequestResponse(Long id, BloodGroup bloodGroup, Urgency urgency, String recipientInfo,
                                BloodComponentType componentType, Integer quantityUnits,
                                Double latitude, Double longitude, Long medicalCenterId,
                                BloodRequestStatus status, String staffResponse, Long approvedById,
                                LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.bloodGroup = bloodGroup;
        this.urgency = urgency;
        this.recipientInfo = recipientInfo;
        this.componentType = componentType;
        this.quantityUnits = quantityUnits;
        this.latitude = latitude;
        this.longitude = longitude;
        this.medicalCenterId = medicalCenterId;
        this.status = status;
        this.staffResponse = staffResponse;
        this.approvedById = approvedById;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static BloodRequestResponse from(BloodRequest request) {
        return new BloodRequestResponse(
                request.getId(),
                request.getBloodGroup(),
                request.getUrgency(),
                request.getRecipientInfo(),
                request.getComponentType(),
                request.getQuantityUnits(),
                request.getLatitude(),
                request.getLongitude(),
                request.getMedicalCenter().getId(),
                request.getStatus(),
                request.getStaffResponse(),
                request.getApprovedBy() == null ? null : request.getApprovedBy().getId(),
                request.getCreatedAt(),
                request.getUpdatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public BloodGroup getBloodGroup() {
        return bloodGroup;
    }

    public Urgency getUrgency() {
        return urgency;
    }

    public String getRecipientInfo() {
        return recipientInfo;
    }

    public BloodComponentType getComponentType() {
        return componentType;
    }

    public Integer getQuantityUnits() {
        return quantityUnits;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public Long getMedicalCenterId() {
        return medicalCenterId;
    }

    public BloodRequestStatus getStatus() {
        return status;
    }

    public String getStaffResponse() {
        return staffResponse;
    }

    public Long getApprovedById() {
        return approvedById;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}

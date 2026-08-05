package com.nhutruong.blood.bloodrequest.domain;

import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.inventory.domain.BloodComponentType;
import com.nhutruong.blood.shared.domain.BloodGroup;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Version;
import org.hibernate.envers.Audited;
import com.nhutruong.blood.shared.domain.BaseAuditEntity;

@jakarta.persistence.Entity
@org.hibernate.envers.Audited
public class BloodRequest extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodGroup bloodGroup;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Urgency urgency;

    @Column(nullable = false)
    private String recipientInfo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodComponentType componentType = BloodComponentType.WHOLE_BLOOD;

    @Column(nullable = false)
    private Integer quantityUnits = 1;

    private Double latitude;
    private Double longitude;

    @ManyToOne(optional = false)
    private User medicalCenter;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodRequestStatus status = BloodRequestStatus.SUBMITTED;

    private String staffResponse;

    @ManyToOne
    private User approvedBy;

    @Version
    private Long version;

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

    public User getMedicalCenter() {
        return medicalCenter;
    }

    public BloodRequestStatus getStatus() {
        return status;
    }

    public String getStaffResponse() {
        return staffResponse;
    }

    public User getApprovedBy() {
        return approvedBy;
    }

    public Long getVersion() {
        return version;
    }

    public void setBloodGroup(BloodGroup bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public void setUrgency(Urgency urgency) {
        this.urgency = urgency;
    }

    public void setRecipientInfo(String recipientInfo) {
        this.recipientInfo = recipientInfo;
    }

    public void setComponentType(BloodComponentType componentType) {
        this.componentType = componentType;
    }

    public void setQuantityUnits(Integer quantityUnits) {
        this.quantityUnits = quantityUnits;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public void setMedicalCenter(User medicalCenter) {
        this.medicalCenter = medicalCenter;
    }

    public void setStatus(BloodRequestStatus status) {
        this.status = status;
    }

    public void setStaffResponse(String staffResponse) {
        this.staffResponse = staffResponse;
    }

    public void setApprovedBy(User approvedBy) {
        this.approvedBy = approvedBy;
    }

    public void setVersion(Long version) {
        this.version = version;
    }
}

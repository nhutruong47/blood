package com.nhutruong.blood.inventory.domain;

import com.nhutruong.blood.bloodrequest.domain.BloodRequest;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.shared.domain.BloodGroup;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;
import org.hibernate.envers.Audited;
import com.nhutruong.blood.shared.domain.BaseAuditEntity;

import java.time.LocalDate;

@jakarta.persistence.Entity
@org.hibernate.envers.Audited
public class BloodUnit extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bag_code", nullable = false, unique = true)
    private String bagCode;

    @ManyToOne
    private User donor;

    @Enumerated(EnumType.STRING)
    @Column(name = "blood_group", nullable = false)
    private BloodGroup bloodGroup;

    @Enumerated(EnumType.STRING)
    @Column(name = "component_type", nullable = false)
    private BloodComponentType componentType;

    @Column(name = "volume_ml", nullable = false)
    private Integer volumeMl;

    @Column(name = "collection_date", nullable = false)
    private LocalDate collectionDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "storage_location")
    private String storageLocation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodUnitStatus status = BloodUnitStatus.QUARANTINED;

    @Enumerated(EnumType.STRING)
    @Column(name = "lab_test_result", nullable = false)
    private LabTestResult labTestResult = LabTestResult.PENDING;

    @ManyToOne
    @JoinColumn(name = "reserved_request_id")
    private BloodRequest reservedFor;

    @Version
    private Long version;

    public Long getId() {
        return id;
    }

    public String getBagCode() {
        return bagCode;
    }

    public User getDonor() {
        return donor;
    }

    public BloodGroup getBloodGroup() {
        return bloodGroup;
    }

    public BloodComponentType getComponentType() {
        return componentType;
    }

    public Integer getVolumeMl() {
        return volumeMl;
    }

    public LocalDate getCollectionDate() {
        return collectionDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public String getStorageLocation() {
        return storageLocation;
    }

    public BloodUnitStatus getStatus() {
        return status;
    }

    public LabTestResult getLabTestResult() {
        return labTestResult;
    }

    public BloodRequest getReservedFor() {
        return reservedFor;
    }

    public Long getVersion() {
        return version;
    }

    public void setBagCode(String bagCode) {
        this.bagCode = bagCode;
    }

    public void setDonor(User donor) {
        this.donor = donor;
    }

    public void setBloodGroup(BloodGroup bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public void setComponentType(BloodComponentType componentType) {
        this.componentType = componentType;
    }

    public void setVolumeMl(Integer volumeMl) {
        this.volumeMl = volumeMl;
    }

    public void setCollectionDate(LocalDate collectionDate) {
        this.collectionDate = collectionDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public void setStorageLocation(String storageLocation) {
        this.storageLocation = storageLocation;
    }

    public void setStatus(BloodUnitStatus status) {
        this.status = status;
    }

    public void setLabTestResult(LabTestResult labTestResult) {
        this.labTestResult = labTestResult;
    }

    public void setReservedFor(BloodRequest reservedFor) {
        this.reservedFor = reservedFor;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public boolean isExpired(LocalDate today) {
        return expiryDate != null && expiryDate.isBefore(today);
    }
}

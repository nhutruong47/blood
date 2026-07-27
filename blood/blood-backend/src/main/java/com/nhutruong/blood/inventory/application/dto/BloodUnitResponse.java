package com.nhutruong.blood.inventory.application.dto;

import com.nhutruong.blood.inventory.domain.BloodComponentType;
import com.nhutruong.blood.inventory.domain.BloodUnit;
import com.nhutruong.blood.inventory.domain.BloodUnitStatus;
import com.nhutruong.blood.inventory.domain.LabTestResult;
import com.nhutruong.blood.shared.domain.BloodGroup;

import java.time.LocalDate;

public record BloodUnitResponse(
        Long id,
        String bagCode,
        BloodGroup bloodGroup,
        BloodComponentType componentType,
        Integer volumeMl,
        LocalDate collectionDate,
        LocalDate expiryDate,
        String storageLocation,
        BloodUnitStatus status,
        LabTestResult labTestResult,
        Long reservedRequestId
) {
    public static BloodUnitResponse from(BloodUnit unit) {
        return new BloodUnitResponse(
                unit.getId(),
                unit.getBagCode(),
                unit.getBloodGroup(),
                unit.getComponentType(),
                unit.getVolumeMl(),
                unit.getCollectionDate(),
                unit.getExpiryDate(),
                unit.getStorageLocation(),
                unit.getStatus(),
                unit.getLabTestResult(),
                unit.getReservedFor() == null ? null : unit.getReservedFor().getId()
        );
    }
}

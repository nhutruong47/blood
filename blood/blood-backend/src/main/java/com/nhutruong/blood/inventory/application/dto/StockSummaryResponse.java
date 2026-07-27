package com.nhutruong.blood.inventory.application.dto;

import com.nhutruong.blood.inventory.domain.BloodComponentType;
import com.nhutruong.blood.inventory.domain.BloodUnitStatus;
import com.nhutruong.blood.shared.domain.BloodGroup;

public record StockSummaryResponse(
        BloodGroup bloodGroup,
        BloodComponentType componentType,
        BloodUnitStatus status,
        long quantity,
        long totalVolumeMl
) {
}

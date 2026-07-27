package com.nhutruong.blood.inventory.api;

import com.nhutruong.blood.inventory.application.InventoryService;
import com.nhutruong.blood.inventory.application.dto.*;
import com.nhutruong.blood.shared.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {
    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping("/units")
    public ApiResponse<BloodUnitResponse> createUnit(@Valid @RequestBody CreateBloodUnitRequest request) {
        return ApiResponse.success("Blood unit created", BloodUnitResponse.from(inventoryService.createUnit(request)));
    }

    @PostMapping("/units/{id}/lab-tests")
    public ApiResponse<BloodUnitResponse> recordLabTest(
            @PathVariable Long id,
            @Valid @RequestBody RecordLabTestRequest request
    ) {
        return ApiResponse.success("Lab test recorded", BloodUnitResponse.from(inventoryService.recordLabTest(id, request)));
    }

    @PostMapping("/reserve")
    public ApiResponse<List<BloodUnitResponse>> reserve(@Valid @RequestBody ReserveBloodUnitsRequest request) {
        return ApiResponse.success(
                "Blood units reserved",
                inventoryService.reserve(request).stream().map(BloodUnitResponse::from).toList()
        );
    }

    @PostMapping("/units/{id}/dispatch")
    public ApiResponse<BloodUnitResponse> dispatch(@PathVariable Long id) {
        return ApiResponse.success("Blood unit dispatched", BloodUnitResponse.from(inventoryService.dispatch(id)));
    }

    @GetMapping("/stock")
    public ApiResponse<List<StockSummaryResponse>> stock() {
        return ApiResponse.success(inventoryService.stock());
    }
}

package com.nhutruong.blood.shipment.api;

import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.shipment.application.ShipmentService;
import com.nhutruong.blood.shipment.domain.Shipment;
import com.nhutruong.blood.shared.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {
    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MEDICALCENTER', 'STAFF', 'ADMIN')")
    public ApiResponse<ShipmentResponse> create(
            @RequestParam Long bloodRequestId,
            @RequestParam String courierName,
            @RequestParam String courierPhone,
            @RequestParam(required = false) String notes,
            @AuthenticationPrincipal User staff
    ) {
        Shipment shipment = shipmentService.create(bloodRequestId, courierName, courierPhone, notes, staff);
        return ApiResponse.success("Shipment created", ShipmentResponse.from(shipment));
    }

    @PostMapping("/{id}/pickup")
    @PreAuthorize("hasAnyRole('MEDICALCENTER', 'STAFF', 'COURIER', 'ADMIN')")
    public ApiResponse<ShipmentResponse> markPickedUp(
            @PathVariable Long id,
            @RequestParam Double temperature,
            @AuthenticationPrincipal User staff
    ) {
        Shipment shipment = shipmentService.markPickedUp(id, temperature, staff);
        return ApiResponse.success("Shipment picked up", ShipmentResponse.from(shipment));
    }

    @PostMapping("/{id}/checkpoint")
    @PreAuthorize("hasAnyRole('MEDICALCENTER', 'STAFF', 'COURIER', 'ADMIN')")
    public ApiResponse<ShipmentResponse> addCheckpoint(
            @PathVariable Long id,
            @RequestParam String location,
            @RequestParam String description,
            @RequestParam(required = false) Double temperature,
            @AuthenticationPrincipal User staff
    ) {
        Shipment shipment = shipmentService.addCheckpoint(id, location, description, temperature, staff);
        return ApiResponse.success("Checkpoint added", ShipmentResponse.from(shipment));
    }

    @PostMapping("/{id}/deliver")
    @PreAuthorize("hasAnyRole('HOSPITAL', 'STAFF', 'ADMIN')")
    public ApiResponse<ShipmentResponse> confirmDelivery(
            @PathVariable Long id,
            @RequestParam String receivedBy,
            @RequestParam(required = false) String notes,
            @AuthenticationPrincipal User staff
    ) {
        Shipment shipment = shipmentService.confirmDelivery(id, receivedBy, notes, staff);
        return ApiResponse.success("Delivery confirmed", ShipmentResponse.from(shipment));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<ShipmentResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(ShipmentResponse.from(shipmentService.getById(id)));
    }

    @GetMapping("/request/{requestId}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<?> getByRequest(@PathVariable Long requestId) {
        return ApiResponse.success(
                shipmentService.getByRequest(requestId).stream()
                        .map(ShipmentResponse::from).toList()
        );
    }

    public record ShipmentResponse(
            Long id,
            Long bloodRequestId,
            String status,
            String courierName,
            String courierPhone,
            String pickedUpAt,
            String deliveredAt,
            Double temperatureAtPickup,
            String notes,
            java.util.List<CheckpointResponse> checkpoints
    ) {
        public static ShipmentResponse from(Shipment s) {
            return new ShipmentResponse(
                    s.getId(),
                    s.getBloodRequest() != null ? s.getBloodRequest().getId() : null,
                    s.getStatus() != null ? s.getStatus().name() : null,
                    s.getCourierName(),
                    s.getCourierPhone(),
                    s.getPickedUpAt() != null ? s.getPickedUpAt().toString() : null,
                    s.getDeliveredAt() != null ? s.getDeliveredAt().toString() : null,
                    s.getTemperatureAtPickup(),
                    s.getNotes(),
                    s.getCheckpoints().stream().map(c ->
                            new CheckpointResponse(c.getLocation(), c.getDescription(),
                                    c.getTimestamp() != null ? c.getTimestamp().toString() : null,
                                    c.getTemperatureReading())
                    ).toList()
            );
        }
    }

    public record CheckpointResponse(String location, String description, String timestamp, Double temperature) {}
}

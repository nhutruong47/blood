package com.nhutruong.blood.shipment.api;

import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.shipment.application.ShipmentService;
import com.nhutruong.blood.shipment.domain.Shipment;
import com.nhutruong.blood.shared.api.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
            @Valid @RequestBody CreateShipmentRequest request,
            @AuthenticationPrincipal User staff
    ) {
        Shipment shipment = shipmentService.create(
                request.bloodRequestId(),
                request.courierName(),
                request.courierPhone(),
                request.notes(),
                staff
        );
        return ApiResponse.success("Shipment created", ShipmentResponse.from(shipment));
    }

    @PostMapping("/{id}/pickup")
    @PreAuthorize("hasAnyRole('MEDICALCENTER', 'STAFF', 'COURIER', 'ADMIN')")
    public ApiResponse<ShipmentResponse> markPickedUp(
            @PathVariable Long id,
            @Valid @RequestBody PickupRequest request,
            @AuthenticationPrincipal User staff
    ) {
        Shipment shipment = shipmentService.markPickedUp(id, request.temperature(), staff);
        return ApiResponse.success("Shipment picked up", ShipmentResponse.from(shipment));
    }

    @PostMapping("/{id}/checkpoint")
    @PreAuthorize("hasAnyRole('MEDICALCENTER', 'STAFF', 'COURIER', 'ADMIN')")
    public ApiResponse<ShipmentResponse> addCheckpoint(
            @PathVariable Long id,
            @Valid @RequestBody AddCheckpointRequest request,
            @AuthenticationPrincipal User staff
    ) {
        Shipment shipment = shipmentService.addCheckpoint(
                id, request.location(), request.description(), request.temperature(), staff
        );
        return ApiResponse.success("Checkpoint added", ShipmentResponse.from(shipment));
    }

    @PostMapping("/{id}/deliver")
    @PreAuthorize("hasAnyRole('HOSPITAL', 'STAFF', 'ADMIN')")
    public ApiResponse<ShipmentResponse> confirmDelivery(
            @PathVariable Long id,
            @Valid @RequestBody DeliveryRequest request,
            @AuthenticationPrincipal User staff
    ) {
        Shipment shipment = shipmentService.confirmDelivery(id, request.receivedBy(), request.notes(), staff);
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

    // ---- Request DTOs ------------------------------------------------------------

    public record CreateShipmentRequest(
            @NotNull(message = "bloodRequestId is required") Long bloodRequestId,
            @NotBlank(message = "courierName is required") String courierName,
            @NotBlank(message = "courierPhone is required") String courierPhone,
            String notes
    ) {}

    public record PickupRequest(
            @NotNull(message = "temperature is required") Double temperature
    ) {}

    public record AddCheckpointRequest(
            @NotBlank(message = "location is required") String location,
            @NotBlank(message = "description is required") String description,
            Double temperature
    ) {}

    public record DeliveryRequest(
            @NotBlank(message = "receivedBy is required") String receivedBy,
            String notes
    ) {}

    // ---- Response DTO -------------------------------------------------------------

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

    public record CheckpointResponse(
            String location, String description, String timestamp, Double temperature
    ) {}
}

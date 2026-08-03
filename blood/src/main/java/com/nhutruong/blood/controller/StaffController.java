package com.nhutruong.blood.controller;

import com.nhutruong.blood.dto.ApiResponse;
import com.nhutruong.blood.dto.BloodInventoryResponse;
import com.nhutruong.blood.dto.BloodInventoryTransactionResponse;
import com.nhutruong.blood.dto.BloodRequestDecisionRequest;
import com.nhutruong.blood.dto.BloodRequestResponse;
import com.nhutruong.blood.dto.DonationDecisionRequest;
import com.nhutruong.blood.dto.DonationRegistrationResponse;
import com.nhutruong.blood.dto.InventoryAdjustmentRequest;
import com.nhutruong.blood.entity.Role;
import com.nhutruong.blood.entity.User;
import com.nhutruong.blood.exception.BusinessRuleException;
import com.nhutruong.blood.service.BloodInventoryService;
import com.nhutruong.blood.service.CurrentUserService;
import com.nhutruong.blood.service.imple.BloodRequestServiceImple;
import com.nhutruong.blood.service.imple.DonationServiceImple;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class StaffController {

    private final BloodRequestServiceImple requestService;
    private final DonationServiceImple donationService;
    private final BloodInventoryService inventoryService;
    private final CurrentUserService currentUserService;

    public StaffController(
            BloodRequestServiceImple requestService,
            DonationServiceImple donationService,
            BloodInventoryService inventoryService,
            CurrentUserService currentUserService
    ) {
        this.requestService = requestService;
        this.donationService = donationService;
        this.inventoryService = inventoryService;
        this.currentUserService = currentUserService;
    }

    @PreAuthorize("hasRole('STAFF')")
    @GetMapping("/api/staff/requests")
    public ApiResponse<List<BloodRequestResponse>> getPendingRequests() {
        List<BloodRequestResponse> data = requestService.pendingRequests().stream()
                .map(BloodRequestResponse::from)
                .toList();
        return ApiResponse.ok("Pending blood requests", data);
    }

    @Deprecated
    @PreAuthorize("hasRole('STAFF')")
    @PostMapping("/api/staff/process-request/{id}")
    public ApiResponse<BloodRequestResponse> processRequest(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String response
    ) {
        User staff = currentUserService.requireRole(Role.STAFF);
        var decision = new BloodRequestDecisionRequest(response, response, null);
        var normalized = status == null ? "" : status.trim().toUpperCase();
        return switch (normalized) {
            case "APPROVED", "DUYET", "DUYỆT" ->
                    ApiResponse.ok("Blood request approved", BloodRequestResponse.from(requestService.approve(id, decision, staff)));
            case "REJECTED", "TU_CHOI", "TỪ CHỐI" ->
                    ApiResponse.ok("Blood request rejected", BloodRequestResponse.from(requestService.reject(id, decision, staff)));
            case "FULFILLED", "HOAN_THANH", "HOÀN THÀNH" ->
                    ApiResponse.ok("Blood request fulfilled", BloodRequestResponse.from(requestService.fulfill(id, decision, staff)));
            default -> throw new BusinessRuleException("Unsupported status value. Use new PATCH endpoints.");
        };
    }

    @PreAuthorize("hasRole('STAFF')")
    @PatchMapping("/api/staff/requests/{id}/approve")
    public ApiResponse<BloodRequestResponse> approveRequest(
            @PathVariable Long id,
            @RequestBody(required = false) BloodRequestDecisionRequest request
    ) {
        User staff = currentUserService.requireRole(Role.STAFF);
        return ApiResponse.ok("Blood request approved", BloodRequestResponse.from(requestService.approve(id, request, staff)));
    }

    @PreAuthorize("hasRole('STAFF')")
    @PatchMapping("/api/staff/requests/{id}/reject")
    public ApiResponse<BloodRequestResponse> rejectRequest(
            @PathVariable Long id,
            @RequestBody BloodRequestDecisionRequest request
    ) {
        User staff = currentUserService.requireRole(Role.STAFF);
        return ApiResponse.ok("Blood request rejected", BloodRequestResponse.from(requestService.reject(id, request, staff)));
    }

    @PreAuthorize("hasRole('STAFF')")
    @PatchMapping("/api/staff/requests/{id}/fulfill")
    public ApiResponse<BloodRequestResponse> fulfillRequest(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) BloodRequestDecisionRequest request
    ) {
        User staff = currentUserService.requireRole(Role.STAFF);
        return ApiResponse.ok("Blood request fulfilled", BloodRequestResponse.from(requestService.fulfill(id, request, staff)));
    }

    @PreAuthorize("hasRole('STAFF')")
    @GetMapping("/api/staff/donations")
    public ApiResponse<List<DonationRegistrationResponse>> getAllDonations() {
        List<DonationRegistrationResponse> data = donationService.staffDonations().stream()
                .map(DonationRegistrationResponse::from)
                .toList();
        return ApiResponse.ok("Donation registrations", data);
    }

    @PreAuthorize("hasRole('STAFF')")
    @PatchMapping("/api/staff/donations/{id}/approve")
    public ApiResponse<DonationRegistrationResponse> approveDonation(
            @PathVariable Long id,
            @RequestBody(required = false) DonationDecisionRequest request
    ) {
        User staff = currentUserService.requireRole(Role.STAFF);
        return ApiResponse.ok("Donation approved", DonationRegistrationResponse.from(donationService.approve(id, request, staff)));
    }

    @PreAuthorize("hasRole('STAFF')")
    @PatchMapping("/api/staff/donations/{id}/reject")
    public ApiResponse<DonationRegistrationResponse> rejectDonation(
            @PathVariable Long id,
            @RequestBody DonationDecisionRequest request
    ) {
        User staff = currentUserService.requireRole(Role.STAFF);
        return ApiResponse.ok("Donation rejected", DonationRegistrationResponse.from(donationService.reject(id, request, staff)));
    }

    @PreAuthorize("hasRole('STAFF')")
    @PatchMapping("/api/staff/donations/{id}/complete")
    public ApiResponse<DonationRegistrationResponse> completeDonation(
            @PathVariable Long id,
            @RequestBody(required = false) DonationDecisionRequest request
    ) {
        User staff = currentUserService.requireRole(Role.STAFF);
        return ApiResponse.ok("Donation completed", DonationRegistrationResponse.from(donationService.complete(id, request, staff)));
    }

    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    @GetMapping("/api/staff/inventory")
    public ApiResponse<List<BloodInventoryResponse>> inventory() {
        List<BloodInventoryResponse> data = inventoryService.findAll().stream()
                .map(BloodInventoryResponse::from)
                .toList();
        return ApiResponse.ok("Blood inventory", data);
    }

    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    @GetMapping("/api/staff/inventory/transactions")
    public ApiResponse<List<BloodInventoryTransactionResponse>> transactions() {
        List<BloodInventoryTransactionResponse> data = inventoryService.findTransactions().stream()
                .map(BloodInventoryTransactionResponse::from)
                .toList();
        return ApiResponse.ok("Blood inventory transactions", data);
    }

    @PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
    @PostMapping("/api/staff/inventory/adjustments")
    public ApiResponse<BloodInventoryResponse> adjust(@Valid @RequestBody InventoryAdjustmentRequest request) {
        User actor = currentUserService.requireRole(Role.STAFF, Role.ADMIN);
        return ApiResponse.ok("Inventory adjusted", BloodInventoryResponse.from(inventoryService.adjust(request, actor)));
    }
}

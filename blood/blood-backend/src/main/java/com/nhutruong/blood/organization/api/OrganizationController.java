package com.nhutruong.blood.organization.api;

import com.nhutruong.blood.audit.application.AuditService;
import com.nhutruong.blood.audit.domain.AuditAction;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.identity.infrastructure.UserRepository;
import com.nhutruong.blood.organization.application.OrganizationService;
import com.nhutruong.blood.organization.application.OrganizationVerificationService;
import com.nhutruong.blood.organization.application.dto.AddMemberRequest;
import com.nhutruong.blood.organization.application.dto.CreateOrganizationRequest;
import com.nhutruong.blood.organization.application.dto.OrganizationMemberResponse;
import com.nhutruong.blood.organization.application.dto.OrganizationResponse;
import com.nhutruong.blood.organization.application.dto.OrganizationStatusChangeRequest;
import com.nhutruong.blood.organization.domain.Organization;
import com.nhutruong.blood.organization.domain.OrganizationMember;
import com.nhutruong.blood.organization.infrastructure.OrganizationMemberRepository;
import com.nhutruong.blood.shared.api.ApiResponse;
import com.nhutruong.blood.shared.exception.BusinessException;
import com.nhutruong.blood.shared.exception.ErrorCode;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {
    private final OrganizationService organizationService;
    private final OrganizationVerificationService verificationService;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public OrganizationController(
            OrganizationService organizationService,
            OrganizationVerificationService verificationService,
            OrganizationMemberRepository organizationMemberRepository,
            UserRepository userRepository,
            AuditService auditService
    ) {
        this.organizationService = organizationService;
        this.verificationService = verificationService;
        this.organizationMemberRepository = organizationMemberRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<OrganizationResponse> create(@Valid @RequestBody CreateOrganizationRequest request) {
        return ApiResponse.success("Organization created", OrganizationResponse.from(organizationService.create(request)));
    }

    @PostMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<OrganizationResponse> verify(
            @PathVariable Long id,
            @AuthenticationPrincipal User admin
    ) {
        return ApiResponse.success("Organization verified",
                OrganizationResponse.from(verificationService.verify(id, admin.getId())));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<OrganizationResponse> reject(
            @PathVariable Long id,
            @Valid @RequestBody OrganizationStatusChangeRequest request,
            @AuthenticationPrincipal User admin
    ) {
        return ApiResponse.success("Organization rejected",
                OrganizationResponse.from(verificationService.reject(id, admin.getId(), request.reason())));
    }

    @PostMapping("/{id}/suspend")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<OrganizationResponse> suspend(
            @PathVariable Long id,
            @Valid @RequestBody OrganizationStatusChangeRequest request,
            @AuthenticationPrincipal User admin
    ) {
        return ApiResponse.success("Organization suspended",
                OrganizationResponse.from(verificationService.suspend(id, admin.getId(), request.reason())));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<OrganizationResponse>> all() {
        return ApiResponse.success(organizationService.all().stream().map(OrganizationResponse::from).toList());
    }

    @PostMapping("/{id}/members")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<OrganizationMemberResponse> addMember(
            @PathVariable Long id,
            @Valid @RequestBody AddMemberRequest request,
            @AuthenticationPrincipal User admin
    ) {
        Organization organization = organizationService.findById(id);
        User user = userRepository.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "User not found"));

        OrganizationMember member = OrganizationMember.builder()
                .organization(organization)
                .user(user)
                .role(request.role())
                .active(true)
                .joinedAt(LocalDateTime.now())
                .build();
        OrganizationMember saved = organizationMemberRepository.save(member);
        auditService.log(admin.getId(), admin.getRole().name(), AuditAction.ORGANIZATION_MEMBER_ADDED,
                "OrganizationMember", String.valueOf(saved.getId()),
                "Added " + user.getEmail() + " to " + organization.getName());
        return ApiResponse.success("Member added", OrganizationMemberResponse.from(saved));
    }

    @GetMapping("/{id}/members")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<OrganizationMemberResponse>> listMembers(@PathVariable Long id) {
        organizationService.findById(id);
        return ApiResponse.success(organizationMemberRepository.findByOrganizationIdAndActiveTrue(id).stream()
                .map(OrganizationMemberResponse::from)
                .toList());
    }

    @DeleteMapping("/{organizationId}/members/{memberId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ApiResponse<Void> removeMember(
            @PathVariable Long organizationId,
            @PathVariable Long memberId,
            @AuthenticationPrincipal User admin
    ) {
        OrganizationMember member = organizationMemberRepository.findById(memberId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Member not found"));
        if (!member.getOrganization().getId().equals(organizationId)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Member does not belong to this organization");
        }
        member.setActive(false);
        organizationMemberRepository.save(member);
        auditService.log(admin.getId(), admin.getRole().name(), AuditAction.ORGANIZATION_MEMBER_REMOVED,
                "OrganizationMember", String.valueOf(memberId),
                "Removed from organization " + organizationId);
        return ApiResponse.success("Member removed", null);
    }
}

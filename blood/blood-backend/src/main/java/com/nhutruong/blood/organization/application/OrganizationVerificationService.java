package com.nhutruong.blood.organization.application;

import com.nhutruong.blood.audit.application.AuditService;
import com.nhutruong.blood.audit.domain.AuditAction;
import com.nhutruong.blood.organization.domain.Organization;
import com.nhutruong.blood.organization.domain.OrganizationStatus;
import com.nhutruong.blood.organization.infrastructure.OrganizationRepository;
import com.nhutruong.blood.shared.exception.BusinessException;
import com.nhutruong.blood.shared.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OrganizationVerificationService {
    private static final Logger log = LoggerFactory.getLogger(OrganizationVerificationService.class);
    private final OrganizationRepository organizationRepository;
    private final AuditService auditService;

    @Transactional
    public Organization verify(Long organizationId, Long verifiedByUserId) {
        Organization organization = getOrganization(organizationId);
        if (organization.getStatus() == OrganizationStatus.VERIFIED) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Organization is already verified");
        }
        if (organization.getStatus() == OrganizationStatus.SUSPENDED) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Cannot verify a suspended organization");
        }

        organization.setStatus(OrganizationStatus.VERIFIED);
        organization.setVerifiedAt(LocalDateTime.now());
        Organization saved = organizationRepository.save(organization);
        auditService.log(verifiedByUserId, "ADMIN", AuditAction.ORGANIZATION_VERIFIED,
                "Organization", String.valueOf(organizationId), "Verified organization: " + organization.getName());
        log.info("Organization {} verified by user {}", organization.getName(), verifiedByUserId);
        return saved;
    }

    @Transactional
    public Organization reject(Long organizationId, Long rejectedByUserId, String reason) {
        Organization organization = getOrganization(organizationId);
        organization.setStatus(OrganizationStatus.REJECTED);
        Organization saved = organizationRepository.save(organization);
        auditService.log(rejectedByUserId, "ADMIN", AuditAction.ORGANIZATION_REJECTED,
                "Organization", String.valueOf(organizationId), "Rejected: " + reason);
        log.info("Organization {} rejected by user {}: {}", organization.getName(), rejectedByUserId, reason);
        return saved;
    }

    @Transactional
    public Organization suspend(Long organizationId, Long suspendedByUserId, String reason) {
        Organization organization = getOrganization(organizationId);
        organization.setStatus(OrganizationStatus.SUSPENDED);
        Organization saved = organizationRepository.save(organization);
        auditService.log(suspendedByUserId, "ADMIN", AuditAction.ORGANIZATION_SUSPENDED,
                "Organization", String.valueOf(organizationId), "Suspended: " + reason);
        log.warn("Organization {} suspended by user {}: {}", organization.getName(), suspendedByUserId, reason);
        return saved;
    }

    private Organization getOrganization(Long organizationId) {
        return organizationRepository.findById(organizationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Organization not found"));
    }
}

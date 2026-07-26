package com.nhutruong.blood.organization.application;

import com.nhutruong.blood.audit.application.AuditService;
import com.nhutruong.blood.audit.domain.AuditAction;
import com.nhutruong.blood.organization.application.dto.CreateOrganizationRequest;
import com.nhutruong.blood.organization.domain.Organization;
import com.nhutruong.blood.organization.domain.OrganizationStatus;
import com.nhutruong.blood.organization.infrastructure.OrganizationRepository;
import com.nhutruong.blood.shared.exception.BusinessException;
import com.nhutruong.blood.shared.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrganizationService {
    private final OrganizationRepository organizationRepository;
    private final AuditService auditService;

    public OrganizationService(OrganizationRepository organizationRepository, AuditService auditService) {
        this.organizationRepository = organizationRepository;
        this.auditService = auditService;
    }

    @Transactional
    public Organization create(CreateOrganizationRequest request) {
        String code = request.code().trim().toUpperCase();
        if (organizationRepository.existsByCode(code)) {
            throw new BusinessException(ErrorCode.CONFLICT, "Organization code already exists");
        }

        Organization organization = new Organization();
        organization.setCode(code);
        organization.setName(request.name().trim());
        organization.setType(request.type());
        organization.setLicenseNumber(request.licenseNumber());
        organization.setPhone(request.phone());
        organization.setEmail(request.email());
        organization.setAddress(request.address());
        organization.setLatitude(request.latitude());
        organization.setLongitude(request.longitude());

        Organization saved = organizationRepository.save(organization);
        auditService.record(null, AuditAction.CREATE, "Organization", saved.getId(), "Organization created");
        return saved;
    }

    @Transactional
    public Organization verify(Long id) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Organization not found"));
        organization.setStatus(OrganizationStatus.VERIFIED);
        organization.setVerifiedAt(LocalDateTime.now());
        Organization saved = organizationRepository.save(organization);
        auditService.record(null, AuditAction.APPROVE, "Organization", saved.getId(), "Organization verified");
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Organization> all() {
        return organizationRepository.findAll();
    }
}

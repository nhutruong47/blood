package com.nhutruong.blood.organization.infrastructure;

import com.nhutruong.blood.organization.domain.Organization;
import com.nhutruong.blood.organization.domain.OrganizationStatus;
import com.nhutruong.blood.organization.domain.OrganizationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    Optional<Organization> findByCode(String code);

    boolean existsByCode(String code);

    List<Organization> findByTypeAndStatus(OrganizationType type, OrganizationStatus status);
}

package com.nhutruong.blood.organization.infrastructure;

import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.organization.domain.Organization;
import com.nhutruong.blood.organization.domain.OrganizationMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrganizationMemberRepository extends JpaRepository<OrganizationMember, Long> {
    List<OrganizationMember> findByUserAndActiveTrue(User user);

    List<OrganizationMember> findByOrganizationAndActiveTrue(Organization organization);
}

package com.nhutruong.blood.bloodrequest.infrastructure;

import com.nhutruong.blood.bloodrequest.domain.BloodRequest;
import com.nhutruong.blood.bloodrequest.domain.BloodRequestStatus;
import com.nhutruong.blood.identity.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BloodRequestRepository extends JpaRepository<BloodRequest, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"medicalCenter"})
    List<BloodRequest> findByStatus(BloodRequestStatus status);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"medicalCenter"})
    List<BloodRequest> findByMedicalCenter(User medicalCenter);
}

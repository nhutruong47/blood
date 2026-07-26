package com.nhutruong.blood.bloodrequest.infrastructure;

import com.nhutruong.blood.bloodrequest.domain.BloodRequest;
import com.nhutruong.blood.bloodrequest.domain.BloodRequestStatus;
import com.nhutruong.blood.identity.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BloodRequestRepository extends JpaRepository<BloodRequest, Long> {
    List<BloodRequest> findByStatus(BloodRequestStatus status);

    List<BloodRequest> findByMedicalCenter(User medicalCenter);
}

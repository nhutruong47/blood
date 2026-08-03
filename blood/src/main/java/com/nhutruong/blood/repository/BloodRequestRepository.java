package com.nhutruong.blood.repository;

import com.nhutruong.blood.entity.BloodRequest;
import com.nhutruong.blood.entity.User;
import com.nhutruong.blood.enums.BloodRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BloodRequestRepository extends JpaRepository<BloodRequest, Long> {
    List<BloodRequest> findByStatus(BloodRequestStatus status);
    List<BloodRequest> findByMedicalCenter(User medicalCenter);
}

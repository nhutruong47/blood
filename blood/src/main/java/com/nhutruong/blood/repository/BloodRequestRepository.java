package com.nhutruong.blood.repository;

import com.nhutruong.blood.entity.BloodRequest;
import com.nhutruong.blood.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BloodRequestRepository extends JpaRepository<BloodRequest, Long> {
    List<BloodRequest> findByStatus(String status);
    List<BloodRequest> findByMedicalCenter(User medicalCenter);
}

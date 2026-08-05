package com.nhutruong.blood.bloodrequest.infrastructure;

import com.nhutruong.blood.bloodrequest.domain.BloodRequest;
import com.nhutruong.blood.bloodrequest.domain.BloodRequestStatus;
import com.nhutruong.blood.bloodrequest.domain.Urgency;
import com.nhutruong.blood.identity.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BloodRequestRepository extends JpaRepository<BloodRequest, Long> {
    @EntityGraph(attributePaths = {"medicalCenter", "approvedBy"})
    List<BloodRequest> findByStatus(BloodRequestStatus status);

    @EntityGraph(attributePaths = {"medicalCenter", "approvedBy"})
    Page<BloodRequest> findByStatus(BloodRequestStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"medicalCenter"})
    List<BloodRequest> findByMedicalCenter(User medicalCenter);

    @EntityGraph(attributePaths = {"medicalCenter"})
    Page<BloodRequest> findByMedicalCenter(User medicalCenter, Pageable pageable);

    @EntityGraph(attributePaths = {"medicalCenter", "approvedBy"})
    @Query("SELECT br FROM BloodRequest br WHERE br.status = :status ORDER BY br.createdAt DESC")
    Page<BloodRequest> findPendingRequestsPageable(@Param("status") BloodRequestStatus status, Pageable pageable);

    /** Aggregating count for the analytics dashboard. */
    long countByUrgency(Urgency urgency);
}

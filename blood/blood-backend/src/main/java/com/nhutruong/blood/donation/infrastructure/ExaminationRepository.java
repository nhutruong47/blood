package com.nhutruong.blood.donation.infrastructure;

import com.nhutruong.blood.donation.domain.Examination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExaminationRepository extends JpaRepository<Examination, Long> {
    Optional<Examination> findByDonationRegistrationId(Long registrationId);
    List<Examination> findByStatus(Examination.ExaminationStatus status);
}

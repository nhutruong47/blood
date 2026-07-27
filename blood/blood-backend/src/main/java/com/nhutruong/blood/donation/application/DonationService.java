package com.nhutruong.blood.donation.application;

import com.nhutruong.blood.donation.application.dto.CreateAppointmentRequest;
import com.nhutruong.blood.donation.application.dto.RegisterDonationRequest;
import com.nhutruong.blood.donation.domain.DonationRegistration;
import com.nhutruong.blood.donation.domain.DonationSchedule;
import com.nhutruong.blood.donation.infrastructure.DonationRegistrationRepository;
import com.nhutruong.blood.donation.infrastructure.DonationScheduleRepository;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.shared.exception.BusinessException;
import com.nhutruong.blood.shared.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DonationService {
    private final DonationRegistrationRepository donationRegistrationRepository;
    private final DonationScheduleRepository scheduleRepository;

    public DonationService(
            DonationRegistrationRepository donationRegistrationRepository,
            DonationScheduleRepository scheduleRepository
    ) {
        this.donationRegistrationRepository = donationRegistrationRepository;
        this.scheduleRepository = scheduleRepository;
    }

    @Transactional
    public DonationRegistration registerDonation(RegisterDonationRequest request, User donor) {
        if (request.age() < 18) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Donor must be at least 18 years old");
        }
        if (request.weight() < 45) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION, "Donor weight must be at least 45 kg");
        }

        DonationSchedule schedule = request.scheduleId() == null ? null : findAvailableSchedule(
                request.scheduleId(), request.donationDate());
        DonationRegistration registration = new DonationRegistration();
        registration.setMedicalCenterName(request.medicalCenterName().trim());
        registration.setDonationDate(request.donationDate());
        registration.setBloodGroup(request.bloodGroup());
        registration.setHealthStatus(request.healthStatus().trim());
        registration.setDonorNotes(null);
        registration.setWeight(request.weight());
        registration.setAmount(request.amount());
        registration.setAge(request.age());
        registration.setDonor(donor);
        registration.setSchedule(schedule);

        return donationRegistrationRepository.save(registration);
    }

    @Transactional
    public DonationRegistration createAppointment(CreateAppointmentRequest request, User donor) {
        if (donor.getBloodGroup() == null) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Donor blood group must be configured before booking an appointment");
        }

        DonationSchedule schedule = findAvailableSchedule(request.scheduleId(), null);
        DonationRegistration registration = new DonationRegistration();
        registration.setMedicalCenterName(schedule.getLocation().getName());
        registration.setDonationDate(schedule.getDonationTime().toLocalDate());
        registration.setBloodGroup(donor.getBloodGroup());
        registration.setHealthStatus("PENDING");
        registration.setDonorNotes(request.donorNotes().trim());
        registration.setDonor(donor);
        registration.setSchedule(schedule);
        return donationRegistrationRepository.save(registration);
    }

    private DonationSchedule findAvailableSchedule(Long scheduleId, java.time.LocalDate requestedDate) {
        DonationSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Donation schedule not found"));
        if (requestedDate != null && !schedule.getDonationTime().toLocalDate().equals(requestedDate)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Donation date does not match the selected schedule");
        }

        String centerName = schedule.getLocation().getName();
        long active = scheduleRepository.countActiveRegistrationsForDate(
                schedule.getDonationTime().toLocalDate(), centerName);
        if (schedule.getCapacity() != null && active >= schedule.getCapacity()) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Schedule is fully booked. Please select another time slot.");
        }
        return schedule;
    }
}

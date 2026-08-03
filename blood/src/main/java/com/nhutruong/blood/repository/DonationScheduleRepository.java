package com.nhutruong.blood.repository;

import com.nhutruong.blood.entity.DonationLocation;
import com.nhutruong.blood.entity.DonationSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;

public interface DonationScheduleRepository extends JpaRepository<DonationSchedule, Long> {
    @Query("""
            select count(s) > 0
            from DonationSchedule s
            where s.location = :location
              and s.startTime < :endTime
              and s.endTime > :startTime
            """)
    boolean existsOverlappingSchedule(DonationLocation location, LocalDateTime startTime, LocalDateTime endTime);
}

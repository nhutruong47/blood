package com.nhutruong.blood.identity.infrastructure;

import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.identity.domain.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByUser(User user);

    Optional<UserProfile> findByUserId(Long userId);
}

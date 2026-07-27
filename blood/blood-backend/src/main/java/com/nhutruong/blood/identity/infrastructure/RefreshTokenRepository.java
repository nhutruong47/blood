package com.nhutruong.blood.identity.infrastructure;

import com.nhutruong.blood.identity.domain.RefreshToken;
import com.nhutruong.blood.identity.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    Optional<RefreshToken> findByUserId(Long userId);

    int deleteByUser(User user);
}

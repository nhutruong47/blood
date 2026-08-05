package com.nhutruong.blood.identity.application;

import com.nhutruong.blood.identity.domain.RefreshToken;
import com.nhutruong.blood.identity.domain.UserStatus;
import com.nhutruong.blood.identity.infrastructure.RefreshTokenRepository;
import com.nhutruong.blood.identity.infrastructure.UserRepository;
import com.nhutruong.blood.shared.exception.BusinessException;
import com.nhutruong.blood.shared.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {
    @Value("${app.jwt-refresh-expiration-milliseconds:2592000000}")
    private Long refreshTokenDurationMs;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, UserRepository userRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        var user = userRepository.findById(userId).orElseThrow(
                () -> new BusinessException(ErrorCode.VALIDATION_ERROR, "User not found")
        );

        // There is a one-to-one constraint between a user and a refresh token.
        // Reuse the managed entity so Hibernate issues an UPDATE when a user
        // signs in again instead of scheduling a DELETE and INSERT in an order
        // that can temporarily violate that constraint.
        RefreshToken refreshToken = refreshTokenRepository.findByUserId(userId)
                .orElseGet(RefreshToken::new);

        refreshToken.setUser(user);
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
        refreshToken.setToken(UUID.randomUUID().toString());

        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new BusinessException(ErrorCode.UNAUTHENTICATED,
                    "Refresh token expired. Please sign in again.");
        }
        if (token.getUser() == null || token.getUser().getStatus() != UserStatus.ACTIVE) {
            refreshTokenRepository.delete(token);
            throw new BusinessException(ErrorCode.UNAUTHENTICATED, "User account is not active.");
        }
        return token;
    }

    @Transactional
    public int deleteByUserId(Long userId) {
        return userRepository.findById(userId)
                .map(refreshTokenRepository::deleteByUser)
                .orElse(0);
    }
}

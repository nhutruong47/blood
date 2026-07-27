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

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        refreshTokenRepository.findByUserId(userId)
                .ifPresent(refreshTokenRepository::delete);

        RefreshToken refreshToken = new RefreshToken();

        refreshToken.setUser(userRepository.findById(userId).orElseThrow(
                () -> new BusinessException(ErrorCode.VALIDATION_ERROR, "User not found")
        ));
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
        refreshToken.setToken(UUID.randomUUID().toString());

        refreshToken = refreshTokenRepository.save(refreshToken);
        return refreshToken;
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

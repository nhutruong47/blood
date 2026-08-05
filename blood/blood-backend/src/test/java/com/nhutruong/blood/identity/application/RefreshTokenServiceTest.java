package com.nhutruong.blood.identity.application;

import com.nhutruong.blood.identity.domain.RefreshToken;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.identity.infrastructure.RefreshTokenRepository;
import com.nhutruong.blood.identity.infrastructure.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private UserRepository userRepository;

    private RefreshTokenService refreshTokenService;

    @BeforeEach
    void setUp() {
        refreshTokenService = new RefreshTokenService(refreshTokenRepository, userRepository);
        ReflectionTestUtils.setField(refreshTokenService, "refreshTokenDurationMs", 60_000L);
    }

    @Test
    void shouldRotateExistingRefreshTokenWithoutDeletingIt() {
        User user = User.builder().id(1L).build();
        RefreshToken existingToken = new RefreshToken();
        existingToken.setUser(user);
        existingToken.setToken("old-token");
        existingToken.setExpiryDate(Instant.EPOCH);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(refreshTokenRepository.findByUserId(1L)).thenReturn(Optional.of(existingToken));
        when(refreshTokenRepository.save(existingToken)).thenReturn(existingToken);

        RefreshToken result = refreshTokenService.createRefreshToken(1L);

        assertSame(existingToken, result);
        assertNotEquals("old-token", result.getToken());
        verify(refreshTokenRepository, never()).delete(existingToken);
        verify(refreshTokenRepository).save(existingToken);
    }
}

package com.nhutruong.blood.identity.infrastructure;

import com.nhutruong.blood.identity.domain.PasswordResetToken;
import com.nhutruong.blood.identity.domain.Role;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.identity.domain.UserStatus;
import com.nhutruong.blood.shared.domain.BloodGroup;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class PasswordResetTokenRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    private User createAndPersistUser(String email) {
        User user = User.builder()
                .email(email)
                .password("encodedPassword")
                .firstName("Test")
                .lastName("User")
                .bloodGroup(BloodGroup.A_POSITIVE)
                .role(Role.DONOR)
                .status(UserStatus.ACTIVE)
                .build();
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        entityManager.persist(user);
        entityManager.flush();
        return user;
    }

    @Nested
    @DisplayName("findByToken tests")
    class FindByTokenTests {

        @Test
        @DisplayName("Should find token by exact token value")
        void shouldFindTokenByExactTokenValue() {
            User user = createAndPersistUser("find@example.com");

            PasswordResetToken token = new PasswordResetToken();
            token.setUser(user);
            entityManager.persist(token);
            entityManager.flush();

            Optional<PasswordResetToken> result = passwordResetTokenRepository.findByToken(token.getToken());

            assertTrue(result.isPresent());
            assertEquals(token.getId(), result.get().getId());
            assertEquals(user.getId(), result.get().getUser().getId());
        }

        @Test
        @DisplayName("Should return empty for non-existent token")
        void shouldReturnEmptyForNonExistentToken() {
            Optional<PasswordResetToken> result = passwordResetTokenRepository.findByToken("non-existent-token");
            assertFalse(result.isPresent());
        }

        @Test
        @DisplayName("Should find token and verify user association")
        void shouldFindTokenAndVerifyUserAssociation() {
            User user = createAndPersistUser("assoc@example.com");

            PasswordResetToken token = new PasswordResetToken();
            token.setUser(user);
            entityManager.persist(token);
            entityManager.flush();

            Optional<PasswordResetToken> result = passwordResetTokenRepository.findByToken(token.getToken());

            assertTrue(result.isPresent());
            assertEquals(user.getEmail(), result.get().getUser().getEmail());
        }
    }

    @Nested
    @DisplayName("deleteByUserId tests")
    class DeleteByUserIdTests {

        @Test
        @DisplayName("Should delete all tokens for a specific user")
        void shouldDeleteAllTokensForSpecificUser() {
            User user = createAndPersistUser("delete1@example.com");

            PasswordResetToken token1 = new PasswordResetToken();
            token1.setUser(user);
            entityManager.persist(token1);

            User anotherUser = createAndPersistUser("delete2@example.com");

            PasswordResetToken token3 = new PasswordResetToken();
            token3.setUser(anotherUser);
            entityManager.persist(token3);
            entityManager.flush();

            passwordResetTokenRepository.deleteByUserId(user.getId());
            entityManager.flush();
            entityManager.clear();

            assertFalse(passwordResetTokenRepository.findById(token1.getId()).isPresent());
            assertTrue(passwordResetTokenRepository.findById(token3.getId()).isPresent());
        }

        @Test
        @DisplayName("Should not throw when user has no tokens")
        void shouldNotThrowWhenUserHasNoTokens() {
            User user = createAndPersistUser("notokens@example.com");

            assertDoesNotThrow(() -> {
                passwordResetTokenRepository.deleteByUserId(user.getId());
                entityManager.flush();
            });
        }
    }

    @Nested
    @DisplayName("deleteExpiredTokens tests")
    class DeleteExpiredTokensTests {

        @Test
        @DisplayName("Should not delete valid tokens (future expiry)")
        void shouldNotDeleteValidTokens() {
            User user = createAndPersistUser("valid@example.com");

            PasswordResetToken validToken = new PasswordResetToken();
            validToken.setUser(user);
            validToken.setExpiryDate(LocalDateTime.now().plusHours(1));
            entityManager.persist(validToken);
            entityManager.flush();

            passwordResetTokenRepository.deleteExpiredTokens(LocalDateTime.now());
            entityManager.flush();
            entityManager.clear();

            // Valid token should still exist
            Optional<PasswordResetToken> found = passwordResetTokenRepository.findById(validToken.getId());
            assertTrue(found.isPresent(), "Valid token should not be deleted");
        }

        @Test
        @DisplayName("Should handle empty database gracefully")
        void shouldHandleEmptyDatabaseGracefully() {
            assertDoesNotThrow(() -> {
                passwordResetTokenRepository.deleteExpiredTokens(LocalDateTime.now());
                entityManager.flush();
            });
        }
    }

    @Nested
    @DisplayName("PasswordResetToken entity lifecycle tests")
    class PasswordResetTokenEntityLifecycleTests {

        @Test
        @DisplayName("Should auto-generate token UUID on persist")
        void shouldAutoGenerateTokenOnPersist() {
            User user = createAndPersistUser("autogen@example.com");

            PasswordResetToken token = new PasswordResetToken();
            token.setUser(user);
            entityManager.persist(token);
            entityManager.flush();

            assertNotNull(token.getToken());
            assertFalse(token.getToken().isEmpty());
        }

        @Test
        @DisplayName("Should set expiry date to 60 minutes on creation")
        void shouldSetExpiryDateOnCreation() {
            User user = createAndPersistUser("expiry@example.com");

            LocalDateTime beforePersist = LocalDateTime.now();
            PasswordResetToken token = new PasswordResetToken();
            token.setUser(user);
            entityManager.persist(token);
            entityManager.flush();
            LocalDateTime afterPersist = LocalDateTime.now();

            assertNotNull(token.getExpiryDate());
            assertTrue(token.getExpiryDate().isAfter(beforePersist.plusMinutes(59)));
            assertTrue(token.getExpiryDate().isBefore(afterPersist.plusMinutes(61)));
        }
    }
}

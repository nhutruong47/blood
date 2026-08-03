package com.nhutruong.blood;

import com.nhutruong.blood.dto.RegisterRequest;
import com.nhutruong.blood.exception.ConflictException;
import com.nhutruong.blood.repository.UserRepository;
import com.nhutruong.blood.service.imple.AuthServiceImple;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ActiveProfiles("test")
@SpringBootTest
@Transactional
class AuthServiceTests {

    @Autowired
    private AuthServiceImple authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void registerStoresBcryptPassword() {
        var user = authService.register(new RegisterRequest(
                "donor-auth@example.com",
                "Password123",
                "Password123",
                "Donor",
                "Auth",
                "O+"
        ));

        assertThat(user.getPassword()).startsWith("$2");
        assertThat(passwordEncoder.matches("Password123", user.getPassword())).isTrue();
    }

    @Test
    void duplicateEmailFails() {
        var request = new RegisterRequest("duplicate@example.com", "Password123", "Password123", "Dupe", "User", "A+");
        authService.register(request);

        assertThatThrownBy(() -> authService.register(request)).isInstanceOf(ConflictException.class);
    }

    @Test
    void loginMatchesEncodedPassword() {
        authService.register(new RegisterRequest("login@example.com", "Password123", "Password123", "Log", "In", "B+"));

        var user = authService.login("login@example.com", "Password123");

        assertThat(user.getEmail()).isEqualTo("login@example.com");
        assertThat(userRepository.findByEmail("login@example.com").getPassword()).startsWith("$2");
    }
}

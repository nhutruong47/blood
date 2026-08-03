package com.nhutruong.blood.service;

import com.nhutruong.blood.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class PasswordMigrationService implements CommandLineRunner {
    private static final String BCRYPT_PREFIX = "$2";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean migrationEnabled;

    public PasswordMigrationService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.security.password-migration.enabled:false}") boolean migrationEnabled
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.migrationEnabled = migrationEnabled;
    }

    @Override
    public void run(String... args) {
        if (!migrationEnabled) {
            return;
        }

        userRepository.findAll().stream()
                .filter(user -> user.getPassword() != null)
                .filter(user -> !user.getPassword().startsWith(BCRYPT_PREFIX))
                .forEach(user -> {
                    user.setPassword(passwordEncoder.encode(user.getPassword()));
                    userRepository.save(user);
                });
    }
}

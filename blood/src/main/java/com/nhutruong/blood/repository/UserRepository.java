package com.nhutruong.blood.repository;


import com.nhutruong.blood.entity.User;
import com.nhutruong.blood.entity.Role;
import com.nhutruong.blood.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
    Optional<User> findOptionalByEmail(String email);
    boolean existsByEmail(String email);
    long countByRoleAndStatus(Role role, UserStatus status);

}

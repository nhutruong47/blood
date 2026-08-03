package com.nhutruong.blood.service;

import com.nhutruong.blood.entity.Role;
import com.nhutruong.blood.entity.User;
import com.nhutruong.blood.exception.ForbiddenException;
import com.nhutruong.blood.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
public class CurrentUserService {

    public User requireUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new UnauthorizedException("Authentication is required");
        }
        return user;
    }

    public User requireRole(Role... roles) {
        User user = requireUser();
        boolean allowed = Arrays.stream(roles).anyMatch(role -> role == user.getRole());
        if (!allowed) {
            throw new ForbiddenException("Insufficient permission");
        }
        return user;
    }
}

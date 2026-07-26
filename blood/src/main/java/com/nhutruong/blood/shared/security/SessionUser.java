package com.nhutruong.blood.shared.security;

import com.nhutruong.blood.identity.domain.Role;
import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.shared.exception.BusinessException;
import com.nhutruong.blood.shared.exception.ErrorCode;
import jakarta.servlet.http.HttpSession;

public final class SessionUser {
    private static final String CURRENT_USER = "currentUser";

    private SessionUser() {
    }

    public static void store(HttpSession session, User user) {
        session.setAttribute(CURRENT_USER, user);
    }

    public static User optional(HttpSession session) {
        Object value = session.getAttribute(CURRENT_USER);
        return value instanceof User user ? user : null;
    }

    public static User requireAuthenticated(HttpSession session) {
        User user = optional(session);
        if (user == null) {
            throw new BusinessException(ErrorCode.UNAUTHENTICATED);
        }
        return user;
    }

    public static User requireRole(HttpSession session, Role role) {
        User user = requireAuthenticated(session);
        if (user.getRole() != role) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        return user;
    }

    public static User requireAnyRole(HttpSession session, Role... roles) {
        User user = requireAuthenticated(session);
        for (Role role : roles) {
            if (user.getRole() == role) {
                return user;
            }
        }
        throw new BusinessException(ErrorCode.FORBIDDEN);
    }
}

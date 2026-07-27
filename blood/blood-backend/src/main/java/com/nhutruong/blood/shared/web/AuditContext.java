package com.nhutruong.blood.shared.web;

import com.nhutruong.blood.identity.domain.User;
import org.slf4j.MDC;

public final class AuditContext {
    public static final String USER_ID = "auditUserId";
    public static final String USER_ROLE = "auditUserRole";
    public static final String IP_ADDRESS = "auditIp";

    private AuditContext() {
    }

    public static void set(User user, String ip) {
        if (user != null) {
            MDC.put(USER_ID, String.valueOf(user.getId()));
            MDC.put(USER_ROLE, user.getRole().name());
        }
        if (ip != null) {
            MDC.put(IP_ADDRESS, ip);
        }
    }

    public static void clear() {
        MDC.remove(USER_ID);
        MDC.remove(USER_ROLE);
        MDC.remove(IP_ADDRESS);
    }
}

package com.nhutruong.blood.shared.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Adds baseline security headers to every response.
 *
 * <p>Defaults are conservative. Override via {@code app.security.headers.csp}
 * (and friends) when deploying behind a known CSP policy.
 */
@Component
@Order(0)
public class SecurityHeadersFilter extends OncePerRequestFilter {

    private static final String DEFAULT_CSP =
            "default-src 'self'; "
                    + "script-src 'self' 'unsafe-inline'; "
                    + "style-src 'self' 'unsafe-inline'; "
                    + "img-src 'self' data: https:; "
                    + "connect-src 'self' http://localhost:8080; "
                    + "frame-ancestors 'none'; "
                    + "base-uri 'self'; "
                    + "form-action 'self'";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain
    ) throws ServletException, IOException {
        // OWASP recommended baseline.
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "DENY");
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        response.setHeader("Permissions-Policy",
                "geolocation=(), microphone=(), camera=(), payment=()");
        response.setHeader("Content-Security-Policy", DEFAULT_CSP);
        // HSTS only when behind HTTPS — disabled by default; turn on in prod
        // with `server.forward-headers-strategy=native` and TLS termination.
        response.setHeader("Strict-Transport-Security", "max-age=0");
        // Remove the server header leak (default behaviour is to set it, but
        // we make the intent explicit).
        response.setHeader("Server", "");

        filterChain.doFilter(request, response);
    }
}

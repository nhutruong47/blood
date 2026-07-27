package com.nhutruong.blood.shared.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Order(1)
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final Map<String, Bucket> BUCKETS = new ConcurrentHashMap<>();
    private static final Map<String, Bucket> AUTH_BUCKETS = new ConcurrentHashMap<>();

    // General endpoints: 100 requests per minute
    private static final int GENERAL_TOKENS = 100;
    private static final Duration GENERAL_REFILL_TIME = Duration.ofMinutes(1);

    // Auth endpoints: 5 attempts per minute (stricter for brute force protection)
    private static final int AUTH_TOKENS = 5;
    private static final Duration AUTH_REFILL_TIME = Duration.ofMinutes(1);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String clientIp = getClientIp(request);

        Bucket bucket = isAuthEndpoint(path)
                ? AUTH_BUCKETS.computeIfAbsent(clientIp, this::createAuthBucket)
                : BUCKETS.computeIfAbsent(clientIp, this::createGeneralBucket);

        if (!bucket.tryConsume(1)) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"success\":false,\"message\":\"Too many requests. Please try again later.\",\"data\":{\"code\":\"RATE_LIMIT_EXCEEDED\",\"retryAfter\":60}}"
            );
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isAuthEndpoint(String path) {
        return path.contains("/api/auth/") ||
               path.contains("/api/v1/auth/") ||
               path.equals("/api/login") ||
               path.equals("/api/register");
    }

    private Bucket createGeneralBucket(String key) {
        Bandwidth limit = Bandwidth.classic(GENERAL_TOKENS, Refill.greedy(GENERAL_TOKENS, GENERAL_REFILL_TIME));
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket createAuthBucket(String key) {
        Bandwidth limit = Bandwidth.classic(AUTH_TOKENS, Refill.greedy(AUTH_TOKENS, AUTH_REFILL_TIME));
        return Bucket.builder().addLimit(limit).build();
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
}

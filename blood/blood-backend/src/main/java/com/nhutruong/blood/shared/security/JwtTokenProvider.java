package com.nhutruong.blood.shared.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Component
public class JwtTokenProvider {

    private static final int MIN_SECRET_LENGTH = 32;

    private final String jwtSecret;
    private final long jwtExpirationDate;
    private final Environment environment;

    public JwtTokenProvider(
            @Value("${app.jwt-secret:}") String jwtSecret,
            @Value("${app.jwt-expiration-milliseconds:86400000}") long jwtExpirationDate,
            Environment environment
    ) {
        this.jwtSecret = jwtSecret;
        this.jwtExpirationDate = jwtExpirationDate;
        this.environment = environment;
    }

    public String generateToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();
        Date currentDate = new Date();
        Date expireDate = new Date(currentDate.getTime() + jwtExpirationDate);

        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .issuer("blood-donation-platform")
                .subject(username)
                .claim("roles", userDetails.getAuthorities().stream()
                        .map(authority -> authority.getAuthority())
                        .toList())
                .issuedAt(currentDate)
                .expiration(expireDate)
                .signWith(getSigningKey())
                .compact();
    }

    private SecretKey getSigningKey() {
        String secret = ensureSecureSecret();
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Refuses to start when the JWT secret is missing or shorter than the minimum.
     * <p>
     * Throws IllegalStateException unconditionally on misconfiguration so the
     * application fails fast at startup rather than silently accepting weak
     * secrets in any environment.
     */
    private String ensureSecureSecret() {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException(
                    "CRITICAL: app.jwt-secret is not configured. "
                            + "Set JWT_SECRET (minimum 32 chars / 256-bit key) in the environment "
                            + "or application-prod.properties. Refusing to start."
            );
        }
        if (jwtSecret.length() < MIN_SECRET_LENGTH) {
            String message = "CRITICAL: JWT secret is too short ("
                    + jwtSecret.length() + " chars). Minimum required: "
                    + MIN_SECRET_LENGTH + " chars (256-bit key for HS256).";
            log.error(message);
            throw new IllegalStateException(message);
        }
        log.info("JWT secret validation passed ({} chars, active profiles={}).",
                jwtSecret.length(),
                String.join(",", environment.getActiveProfiles()));
        return jwtSecret;
    }

    public String getUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (ExpiredJwtException ex) {
            log.warn("JWT token expired: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            log.warn("Unsupported JWT token: {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            log.warn("Malformed JWT token: {}", ex.getMessage());
        } catch (io.jsonwebtoken.security.SecurityException ex) {
            log.warn("Invalid JWT signature: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            log.warn("JWT claims string is empty: {}", ex.getMessage());
        }
        return false;
    }

    public boolean isTokenExpired(String token) {
        try {
            Claims claims = parseClaims(token);
            return claims.getExpiration().before(new Date());
        } catch (ExpiredJwtException ex) {
            return true;
        }
    }
}

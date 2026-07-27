package com.nhutruong.blood.shared.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Component
public class JwtTokenProvider {

    private static final int MIN_SECRET_LENGTH = 32;

    @Value("${app.jwt-secret}")
    private String jwtSecret;

    @Value("${app.jwt-expiration-milliseconds:86400000}")
    private long jwtExpirationDate;

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

    private String ensureSecureSecret() {
        if (jwtSecret == null || jwtSecret.isEmpty()) {
            throw new IllegalStateException(
                    "CRITICAL: app.jwt-secret is not configured. "
                            + "Set a secure secret (min 256 bits / 32 chars) in application-prod.properties. "
                            + "Generated secret is FORBIDDEN in production."
            );
        }
        if (jwtSecret.length() < MIN_SECRET_LENGTH) {
            String message = "JWT secret too short (" + jwtSecret.length()
                    + " chars). Minimum 32 chars required.";
            if (Arrays.stream(new String[]{""})
                    .anyMatch(profile -> System.getProperty("spring.profiles.active", "").contains("prod"))) {
                throw new IllegalStateException(message);
            }
            log.warn("WARN: {}", message);
        }
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

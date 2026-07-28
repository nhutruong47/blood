package com.nhutruong.blood.shared.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI / Springdoc configuration. Declares the global metadata and the
 * JWT bearer security scheme so the Swagger UI shows an "Authorize" button
 * that accepts the access token issued by POST /api/login.
 */
@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Blood Donation Management API",
                version = "1.0.0",
                description = "Enterprise-ready modular monolith API for blood donation workflows, "
                        + "geo search, organizations, inventory, donor matching, and SEO metadata.",
                contact = @Contact(name = "Blood Platform Team"),
                license = @License(name = "Internal")
        ),
        servers = {
                @Server(url = "/", description = "Current host")
        }
)
@SecurityScheme(
        name = "BearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        description = "JWT access token returned by POST /api/login. Send as `Authorization: Bearer <token>`."
)
public class OpenApiConfig {
}
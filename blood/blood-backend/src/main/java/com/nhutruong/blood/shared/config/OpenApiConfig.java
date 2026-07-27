package com.nhutruong.blood.shared.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Blood Donation Management API",
                version = "1.0.0",
                description = "Enterprise-ready modular monolith API for blood donation workflows, geo search, and SEO metadata.",
                contact = @Contact(name = "Blood Platform Team"),
                license = @License(name = "Internal")
        )
)
public class OpenApiConfig {
}

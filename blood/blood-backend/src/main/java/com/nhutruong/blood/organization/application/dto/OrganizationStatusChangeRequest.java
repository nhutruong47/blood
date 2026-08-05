package com.nhutruong.blood.organization.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Payload submitted by an admin when rejecting (or suspending) an
 * organization. The {@code reason} is required so the audit log captures
 * a human-readable justification for the state change.
 */
public record OrganizationStatusChangeRequest(
        @NotBlank(message = "Reason is required")
        @Size(min = 5, max = 500, message = "Reason must be 5-500 characters")
        String reason
) {
}

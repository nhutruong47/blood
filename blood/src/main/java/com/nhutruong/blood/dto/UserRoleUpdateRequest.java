package com.nhutruong.blood.dto;

import com.nhutruong.blood.entity.Role;
import jakarta.validation.constraints.NotNull;

public record UserRoleUpdateRequest(@NotNull Role role) {
}

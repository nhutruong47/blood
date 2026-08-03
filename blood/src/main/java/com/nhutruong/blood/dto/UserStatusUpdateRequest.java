package com.nhutruong.blood.dto;

import com.nhutruong.blood.enums.UserStatus;
import jakarta.validation.constraints.NotNull;

public record UserStatusUpdateRequest(@NotNull UserStatus status) {
}

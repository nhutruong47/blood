package com.nhutruong.blood.dto;

import jakarta.validation.constraints.NotBlank;

public record DonationLocationRequest(@NotBlank String name, @NotBlank String address) {
}

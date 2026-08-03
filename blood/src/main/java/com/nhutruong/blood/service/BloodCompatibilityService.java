package com.nhutruong.blood.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class BloodCompatibilityService {
    private static final Map<String, List<String>> RED_CELL_COMPATIBILITY = Map.of(
            "O-", List.of("O-"),
            "O+", List.of("O-", "O+"),
            "A-", List.of("O-", "A-"),
            "A+", List.of("O-", "O+", "A-", "A+"),
            "B-", List.of("O-", "B-"),
            "B+", List.of("O-", "O+", "B-", "B+"),
            "AB-", List.of("O-", "A-", "B-", "AB-"),
            "AB+", List.of("O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+")
    );

    public boolean isValidBloodGroup(String bloodGroup) {
        return RED_CELL_COMPATIBILITY.containsKey(bloodGroup);
    }

    public List<String> compatibleDonorGroupsForRecipient(String recipientBloodGroup) {
        return RED_CELL_COMPATIBILITY.getOrDefault(recipientBloodGroup, List.of());
    }

    public boolean isCompatible(String donorBloodGroup, String recipientBloodGroup) {
        return compatibleDonorGroupsForRecipient(recipientBloodGroup).contains(donorBloodGroup);
    }
}

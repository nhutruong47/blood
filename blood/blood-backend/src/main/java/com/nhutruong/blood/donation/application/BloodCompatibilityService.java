package com.nhutruong.blood.donation.application;

import com.nhutruong.blood.donation.application.dto.BloodCompatibilityResponse;
import com.nhutruong.blood.shared.domain.BloodGroup;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import static com.nhutruong.blood.shared.domain.BloodGroup.*;

@Service
public class BloodCompatibilityService {
    private static final Map<BloodGroup, List<BloodGroup>> DONATE_TO = new EnumMap<>(BloodGroup.class);
    private static final Map<BloodGroup, List<BloodGroup>> RECEIVE_FROM = new EnumMap<>(BloodGroup.class);

    static {
        DONATE_TO.put(O_NEGATIVE, List.of(O_NEGATIVE, O_POSITIVE, A_NEGATIVE, A_POSITIVE, B_NEGATIVE, B_POSITIVE, AB_NEGATIVE, AB_POSITIVE));
        DONATE_TO.put(O_POSITIVE, List.of(O_POSITIVE, A_POSITIVE, B_POSITIVE, AB_POSITIVE));
        DONATE_TO.put(A_NEGATIVE, List.of(A_NEGATIVE, A_POSITIVE, AB_NEGATIVE, AB_POSITIVE));
        DONATE_TO.put(A_POSITIVE, List.of(A_POSITIVE, AB_POSITIVE));
        DONATE_TO.put(B_NEGATIVE, List.of(B_NEGATIVE, B_POSITIVE, AB_NEGATIVE, AB_POSITIVE));
        DONATE_TO.put(B_POSITIVE, List.of(B_POSITIVE, AB_POSITIVE));
        DONATE_TO.put(AB_NEGATIVE, List.of(AB_NEGATIVE, AB_POSITIVE));
        DONATE_TO.put(AB_POSITIVE, List.of(AB_POSITIVE));

        RECEIVE_FROM.put(O_NEGATIVE, List.of(O_NEGATIVE));
        RECEIVE_FROM.put(O_POSITIVE, List.of(O_NEGATIVE, O_POSITIVE));
        RECEIVE_FROM.put(A_NEGATIVE, List.of(O_NEGATIVE, A_NEGATIVE));
        RECEIVE_FROM.put(A_POSITIVE, List.of(O_NEGATIVE, O_POSITIVE, A_NEGATIVE, A_POSITIVE));
        RECEIVE_FROM.put(B_NEGATIVE, List.of(O_NEGATIVE, B_NEGATIVE));
        RECEIVE_FROM.put(B_POSITIVE, List.of(O_NEGATIVE, O_POSITIVE, B_NEGATIVE, B_POSITIVE));
        RECEIVE_FROM.put(AB_NEGATIVE, List.of(O_NEGATIVE, A_NEGATIVE, B_NEGATIVE, AB_NEGATIVE));
        RECEIVE_FROM.put(AB_POSITIVE, List.of(O_NEGATIVE, O_POSITIVE, A_NEGATIVE, A_POSITIVE, B_NEGATIVE, B_POSITIVE, AB_NEGATIVE, AB_POSITIVE));
    }

    public List<BloodCompatibilityResponse> all() {
        return List.of(BloodGroup.values()).stream()
                .map(this::forGroup)
                .toList();
    }

    public List<BloodGroup> getCompatibleDonorGroups(BloodGroup recipient) {
        return RECEIVE_FROM.getOrDefault(recipient, List.of());
    }

    public BloodCompatibilityResponse forGroup(BloodGroup bloodGroup) {
        return new BloodCompatibilityResponse(
                bloodGroup,
                DONATE_TO.get(bloodGroup),
                RECEIVE_FROM.get(bloodGroup),
                noteFor(bloodGroup)
        );
    }

    private String noteFor(BloodGroup bloodGroup) {
        return switch (bloodGroup) {
            case O_NEGATIVE -> "O-negative is often used in emergencies because it can be given to many recipients.";
            case AB_POSITIVE -> "AB-positive recipients can receive red blood cells from all ABO/Rh groups.";
            case AB_NEGATIVE -> "AB-negative is rare and can donate to AB-negative and AB-positive recipients.";
            default -> "Compatibility depends on ABO and Rh type. Medical staff always confirm compatibility before transfusion.";
        };
    }
}

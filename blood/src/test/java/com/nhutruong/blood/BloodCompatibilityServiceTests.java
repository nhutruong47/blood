package com.nhutruong.blood;

import com.nhutruong.blood.service.BloodCompatibilityService;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class BloodCompatibilityServiceTests {

    private final BloodCompatibilityService service = new BloodCompatibilityService();

    @Test
    void compatibleGroupsIncludeExactMatch() {
        assertThat(service.compatibleDonorGroupsForRecipient("A+")).contains("A+");
    }

    @Test
    void incompatibleGroupsAreRejected() {
        assertThat(service.isCompatible("B+", "A+")).isFalse();
    }

    @Test
    void invalidBloodGroupIsRejected() {
        assertThat(service.isValidBloodGroup("X+")).isFalse();
    }
}

package com.nhutruong.blood.service;

import com.nhutruong.blood.dto.BloodRequestCreateRequest;
import com.nhutruong.blood.dto.BloodRequestDecisionRequest;
import com.nhutruong.blood.entity.BloodRequest;
import com.nhutruong.blood.entity.User;

import java.util.List;

public interface BloodRequestService {
    BloodRequest createRequest(BloodRequestCreateRequest request, User medicalCenter);
    List<BloodRequest> myRequests(User medicalCenter);
    List<BloodRequest> pendingRequests();
    BloodRequest approve(Long id, BloodRequestDecisionRequest request, User staff);
    BloodRequest reject(Long id, BloodRequestDecisionRequest request, User staff);
    BloodRequest fulfill(Long id, BloodRequestDecisionRequest request, User staff);
}

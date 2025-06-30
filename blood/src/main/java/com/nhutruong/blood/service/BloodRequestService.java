package com.nhutruong.blood.service;

import com.nhutruong.blood.entity.BloodRequest;
import com.nhutruong.blood.repository.BloodRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BloodRequestService {

    @Autowired
    private BloodRequestRepository repository;

    public void createRequest(BloodRequest request) {
        repository.save(request);
    }
}

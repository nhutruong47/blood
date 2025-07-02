package com.nhutruong.blood.service.imple;

import com.nhutruong.blood.entity.BloodRequest;
import com.nhutruong.blood.repository.BloodRequestRepository;
import com.nhutruong.blood.service.BloodRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BloodRequestServiceImple implements BloodRequestService {

    @Autowired
    private BloodRequestRepository repository;

    @Override
    public void createRequest(BloodRequest request) {
        repository.save(request);
    }
}

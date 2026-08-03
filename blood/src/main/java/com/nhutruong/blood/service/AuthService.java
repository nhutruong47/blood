package com.nhutruong.blood.service;

import com.nhutruong.blood.dto.RegisterRequest;
import com.nhutruong.blood.entity.User;

public interface AuthService {
    User login(String email, String password);
    User register(RegisterRequest request);
}

package com.nhutruong.blood.service;

import com.nhutruong.blood.entity.User;

public interface AuthService {
    User login(String email, String password);
    void register(User user);
}

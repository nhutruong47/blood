package com.nhutruong.blood.controller;

import com.nhutruong.blood.entity.Role;
import com.nhutruong.blood.entity.User;
import com.nhutruong.blood.service.imple.AuthServiceImple;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
public class AuthController {

    @Autowired
    private AuthServiceImple authService;

    @PostMapping("/api/register")
    public String register(@RequestBody User user) {
        user.setRole(Role.DONOR); // Gán role mặc định là DONOR
        authService.register(user);
        return "Đăng ký thành công với vai trò hiến máu (donor)";
    }

    @PostMapping("/api/login")
    public Map<String, Object> login(@RequestBody User user, HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            User loginUser = authService.login(user.getEmail(), user.getPassword());
            session.setAttribute("currentUser", loginUser);

            response.put("message", "Đăng nhập thành công");

            String redirectUrl = switch (loginUser.getRole().name()) {
                case "ADMIN" -> "/dashboardAdmin";
                case "STAFF" -> "/dashboardStaff";
                case "MEDICALCENTER" -> "/dashboardMedicalcenter";
                case "DONOR" -> "/home";
                default -> "/unknown-role";
            };
            response.put("redirect", redirectUrl);
        } catch (Exception e) {
            response.put("message", e.getMessage()); // chi tiết lỗi (email không tồn tại hoặc sai password)
        }

        return response;
    }

    @GetMapping("/api/me")
    public Object me(HttpSession session) {
        Object user = session.getAttribute("currentUser");
        if (user == null) {
            return "Chưa đăng nhập";
        }
        return user;
    }

    @PostMapping("/api/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "Đã đăng xuất";
    }


}

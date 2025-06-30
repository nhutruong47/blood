package com.nhutruong.blood.controller;

import com.nhutruong.blood.entity.DonationRegistration;
import com.nhutruong.blood.entity.User;
import com.nhutruong.blood.service.DonationService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
public class DonationController {

    @Autowired
    private DonationService donationService;

    @PostMapping("/api/donate/register")
    public String registerDonation(@RequestBody DonationRegistration registration, HttpSession session) {
        User currentUser = (User) session.getAttribute("currentUser");

        if (currentUser == null) {
            return "Bạn chưa đăng nhập";
        }

        registration.setDonor(currentUser);
        donationService.registerDonation(registration);

        return "Đăng ký hiến máu thành công. Vui lòng chờ duyệt.";
    }

}

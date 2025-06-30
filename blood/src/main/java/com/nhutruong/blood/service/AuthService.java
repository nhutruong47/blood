package com.nhutruong.blood.service;

import com.nhutruong.blood.entity.User;
import com.nhutruong.blood.exception.CustomException;
import com.nhutruong.blood.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public User login(String email, String password) {
        if (email == null || email.isEmpty() || password == null || password.isEmpty()) {
            throw new CustomException("Email và mật khẩu không được để trống");
        }

        User user = userRepository.findByEmail(email);

        // Debug: In ra thông tin để kiểm tra
        System.out.println("Email nhập vào: " + email);
        System.out.println("Password nhập vào: " + password);

        if (user == null) {
            throw new CustomException("Không tìm thấy email trong hệ thống");
        }

        System.out.println("Password trong database: " + user.getPassword());

        // So sánh password (chú ý: nếu có mã hóa thì thay đoạn này)
        if (!password.equals(user.getPassword())) {
            throw new CustomException("Mật khẩu không đúng");
        }

        return user;
    }

    public void register(User user) {
        String email = user.getEmail();
        String password = user.getPassword();
        String confirmPassword = user.getConfirmPassword(); // cần có trường confirmPassword trong entity
        String firstName = user.getFirstName();
        String lastName = user.getLastName();
        String bloodGroup = user.getBloodGroup();

        if (email == null || email.isEmpty() ||
                password == null || password.isEmpty() ||
                confirmPassword == null || confirmPassword.isEmpty() ||
                firstName == null || firstName.isEmpty() ||
                lastName == null || lastName.isEmpty() ||
                bloodGroup == null || bloodGroup.isEmpty()) {
            throw new CustomException("Vui lòng điền đầy đủ thông tin");
        }

        if (!password.equals(confirmPassword)) {
            throw new CustomException("Mật khẩu xác nhận không khớp");
        }

        if (userRepository.findByEmail(email) != null) {
            throw new CustomException("Email đã được sử dụng");
        }

        // Nếu bạn muốn mã hóa mật khẩu thì thêm ở đây (ví dụ với BCrypt)
        // user.setPassword(new BCryptPasswordEncoder().encode(password));

        userRepository.save(user);
    }
}

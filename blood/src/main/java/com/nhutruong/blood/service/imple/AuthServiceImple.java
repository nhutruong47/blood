package com.nhutruong.blood.service.imple;

import com.nhutruong.blood.entity.User;
import com.nhutruong.blood.exception.CustomException;
import com.nhutruong.blood.repository.UserRepository;
import com.nhutruong.blood.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImple implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public User login(String email, String password) {
        if (email == null || email.isEmpty() || password == null || password.isEmpty()) {
            throw new CustomException("Email và mật khẩu không được để trống");
        }

        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new CustomException("Không tìm thấy email trong hệ thống");
        }

        if (!password.equals(user.getPassword())) {
            throw new CustomException("Mật khẩu không đúng");
        }

        return user;
    }

    @Override
    public void register(User user) {
        String email = user.getEmail();
        String password = user.getPassword();
        String confirmPassword = user.getConfirmPassword();
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

        userRepository.save(user);
    }
}

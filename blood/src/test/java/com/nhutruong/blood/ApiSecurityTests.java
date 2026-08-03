package com.nhutruong.blood;

import com.nhutruong.blood.entity.Role;
import com.nhutruong.blood.entity.User;
import com.nhutruong.blood.enums.UserStatus;
import com.nhutruong.blood.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ApiSecurityTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void protectedEndpointWithoutLoginReturns401() throws Exception {
        mockMvc.perform(get("/api/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void donorCallingStaffEndpointReturns403() throws Exception {
        MockHttpSession session = login("donor-security@example.com", Role.DONOR);

        mockMvc.perform(get("/api/staff/donations").session(session))
                .andExpect(status().isForbidden());
    }

    @Test
    void invalidRegisterRequestReturns400() throws Exception {
        mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"bad","password":"short","confirmPassword":"short","firstName":"","lastName":"User","bloodGroup":"X+"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors").exists());
    }

    @Test
    void registerAndLoginDoNotReturnPassword() throws Exception {
        mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"api-register@example.com","password":"Password123","confirmPassword":"Password123","firstName":"Api","lastName":"User","bloodGroup":"A+"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.password").doesNotExist());

        var result = mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"api-register@example.com","password":"Password123"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.user.password").doesNotExist())
                .andReturn();

        org.assertj.core.api.Assertions.assertThat(result.getRequest().getSession(false)).isNotNull();
    }

    private MockHttpSession login(String email, Role role) throws Exception {
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("Password123"));
        user.setFirstName("Test");
        user.setLastName("User");
        user.setBloodGroup("O+");
        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        return (MockHttpSession) mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"Password123"}
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andReturn()
                .getRequest()
                .getSession(false);
    }
}

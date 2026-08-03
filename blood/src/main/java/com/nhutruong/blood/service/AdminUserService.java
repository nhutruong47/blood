package com.nhutruong.blood.service;

import com.nhutruong.blood.dto.UserRoleUpdateRequest;
import com.nhutruong.blood.dto.UserStatusUpdateRequest;
import com.nhutruong.blood.entity.Role;
import com.nhutruong.blood.entity.User;
import com.nhutruong.blood.enums.UserStatus;
import com.nhutruong.blood.exception.BusinessRuleException;
import com.nhutruong.blood.exception.ResourceNotFoundException;
import com.nhutruong.blood.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminUserService {

    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public AdminUserService(UserRepository userRepository, AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional
    public User updateRole(Long id, UserRoleUpdateRequest request, User admin) {
        User user = findById(id);
        if (user.getRole() == Role.ADMIN && request.role() != Role.ADMIN && isLastActiveAdmin(user)) {
            throw new BusinessRuleException("Cannot remove the last active admin");
        }
        Role oldRole = user.getRole();
        user.setRole(request.role());
        User saved = userRepository.save(user);
        auditLogService.record(admin, "ADMIN_USER_ROLE_UPDATE", "User", id, oldRole.name(), saved.getRole().name());
        return saved;
    }

    @Transactional
    public User updateStatus(Long id, UserStatusUpdateRequest request, User admin) {
        User user = findById(id);
        if (user.getRole() == Role.ADMIN && request.status() != UserStatus.ACTIVE && isLastActiveAdmin(user)) {
            throw new BusinessRuleException("Cannot disable the last active admin");
        }
        UserStatus oldStatus = user.getStatus();
        user.setStatus(request.status());
        User saved = userRepository.save(user);
        auditLogService.record(admin, "ADMIN_USER_STATUS_UPDATE", "User", id, oldStatus.name(), saved.getStatus().name());
        return saved;
    }

    private boolean isLastActiveAdmin(User user) {
        return user.getStatus() == UserStatus.ACTIVE
                && userRepository.countByRoleAndStatus(Role.ADMIN, UserStatus.ACTIVE) <= 1;
    }
}

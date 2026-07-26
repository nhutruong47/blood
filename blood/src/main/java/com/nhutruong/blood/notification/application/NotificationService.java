package com.nhutruong.blood.notification.application;

import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.notification.domain.NotificationChannel;
import com.nhutruong.blood.notification.domain.NotificationMessage;
import com.nhutruong.blood.notification.infrastructure.NotificationMessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {
    private final NotificationMessageRepository notificationRepository;

    public NotificationService(NotificationMessageRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public List<NotificationMessage> emergencyAlert(List<User> recipients, Long bloodRequestId, String bloodGroup) {
        List<NotificationMessage> messages = recipients.stream().map(recipient -> {
            NotificationMessage message = new NotificationMessage();
            message.setRecipient(recipient);
            message.setChannel(NotificationChannel.REALTIME);
            message.setTitle("Emergency blood request");
            message.setBody("Urgent " + bloodGroup + " blood request needs donor response.");
            message.setReferenceType("BloodRequest");
            message.setReferenceId(String.valueOf(bloodRequestId));
            return message;
        }).toList();
        return notificationRepository.saveAll(messages);
    }
}

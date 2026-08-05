package com.nhutruong.blood.notification.application;

import com.nhutruong.blood.identity.domain.User;
import com.nhutruong.blood.notification.domain.NotificationChannel;
import com.nhutruong.blood.notification.domain.NotificationMessage;
import com.nhutruong.blood.notification.infrastructure.NotificationMessageRepository;
import com.nhutruong.blood.identity.infrastructure.UserProfileRepository;
import com.nhutruong.blood.identity.domain.UserProfile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Service
public class NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private final NotificationMessageRepository notificationRepository;
    private final UserProfileRepository userProfileRepository;

    public NotificationService(NotificationMessageRepository notificationRepository, UserProfileRepository userProfileRepository) {
        this.notificationRepository = notificationRepository;
        this.userProfileRepository = userProfileRepository;
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
            
            userProfileRepository.findByUserId(recipient.getId()).ifPresent(profile -> {
                if (profile.isEmergencyAlertOptIn()) {
                    if (profile.isEmailNotifications()) {
                        sendDummyEmail(recipient.getEmail(), message.getTitle(), message.getBody());
                    }
                    if (profile.isSmsNotifications() && profile.getPhone() != null && !profile.getPhone().isEmpty()) {
                        sendDummySms(profile.getPhone(), message.getBody());
                    }
                }
            });
            
            return message;
        }).toList();
        return notificationRepository.saveAll(messages);
    }

    @Transactional
    public void sendNotification(User recipient, String body) {
        NotificationMessage message = new NotificationMessage();
        message.setRecipient(recipient);
        message.setChannel(NotificationChannel.REALTIME);
        message.setTitle("Notification");
        message.setBody(body);
        notificationRepository.save(message);

        userProfileRepository.findByUserId(recipient.getId()).ifPresent(profile -> {
            if (profile.isEmailNotifications()) {
                sendDummyEmail(recipient.getEmail(), "Notification", body);
            }
            if (profile.isSmsNotifications() && profile.getPhone() != null && !profile.getPhone().isEmpty()) {
                sendDummySms(profile.getPhone(), body);
            }
        });
    }

    private void sendDummyEmail(String to, String subject, String body) {
        log.info("Sending external Email to {}: [{}] {}", to, subject, body);
    }

    private void sendDummySms(String phone, String body) {
        log.info("Sending external SMS to {}: {}", phone, body);
    }
}

package com.nhutruong.blood.notification.application;

import com.nhutruong.blood.bloodrequest.domain.event.BloodRequestApprovedEvent;
import com.nhutruong.blood.identity.domain.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class NotificationEventListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventListener.class);
    private final NotificationService notificationService;

    public NotificationEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleBloodRequestApproved(BloodRequestApprovedEvent event) {
        log.info("Received BloodRequestApprovedEvent for request ID: {}", event.bloodRequest().getId());
        
        User medicalCenter = event.bloodRequest().getMedicalCenter();
        String message = String.format("Your blood request for %d units of %s has been approved.", 
                event.bloodRequest().getQuantityUnits(), 
                event.bloodRequest().getBloodGroup().name());
                
        notificationService.sendNotification(medicalCenter, message);
    }
}

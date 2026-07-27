package com.nhutruong.blood.notification.infrastructure;

import com.nhutruong.blood.notification.domain.NotificationMessage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationMessageRepository extends JpaRepository<NotificationMessage, Long> {
}

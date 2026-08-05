package com.nhutruong.blood.notification.infrastructure;

import com.nhutruong.blood.notification.domain.NotificationMessage;
import com.nhutruong.blood.notification.domain.NotificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationMessageRepository extends JpaRepository<NotificationMessage, Long> {

    @EntityGraph(attributePaths = {"recipient"})
    Page<NotificationMessage> findByRecipientIdOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

    @EntityGraph(attributePaths = {"recipient"})
    Page<NotificationMessage> findByStatusOrderByCreatedAtDesc(NotificationStatus status, Pageable pageable);
}

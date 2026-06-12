package com.dataquest.infrastructure.persistence.repository;

import com.dataquest.infrastructure.persistence.entity.MessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface SpringDataMessageRepository extends JpaRepository<MessageEntity, Long> {
    List<MessageEntity> findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderByCreatedAtAsc(
        Long senderId1, Long receiverId1, Long senderId2, Long receiverId2);

    long countBySenderIdAndReceiverIdAndIsRead(Long senderId, Long receiverId, Boolean isRead);

    @Modifying
    @Transactional
    @Query("UPDATE MessageEntity m SET m.isRead = true WHERE m.senderId = ?1 AND m.receiverId = ?2 AND (m.isRead IS NULL OR m.isRead = false)")
    void markAsReadBySenderAndReceiver(Long senderId, Long receiverId);
}

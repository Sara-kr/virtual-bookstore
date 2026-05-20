package com.bookstore.service.impl;

import com.bookstore.dto.response.NotificationResponse;
import com.bookstore.entity.Notification;
import com.bookstore.entity.User;
import com.bookstore.enums.NotificationType;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.NotificationRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void createNotification(Long userId, String title, String message,
                                   NotificationType type, Long referenceId, String referenceType) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Notification notification = Notification.builder()
            .user(user)
            .title(title)
            .message(message)
            .type(type)
            .referenceId(referenceId)
            .referenceType(referenceType)
            .isRead(false)
            .build();

        notificationRepository.save(notification);
        log.debug("Notification created for user {}: {}", userId, title);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
            .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new com.bookstore.exception.BusinessException("Access denied");
        }
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
            .id(n.getId())
            .title(n.getTitle())
            .message(n.getMessage())
            .type(n.getType())
            .isRead(n.getIsRead())
            .referenceId(n.getReferenceId())
            .referenceType(n.getReferenceType())
            .createdAt(n.getCreatedAt())
            .build();
    }
}

package com.bookstore.service;

import com.bookstore.dto.response.NotificationResponse;
import com.bookstore.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    void createNotification(Long userId, String title, String message,
                            NotificationType type, Long referenceId, String referenceType);
    Page<NotificationResponse> getUserNotifications(Long userId, Pageable pageable);
    long getUnreadCount(Long userId);
    void markAllAsRead(Long userId);
    void markAsRead(Long notificationId, Long userId);
}

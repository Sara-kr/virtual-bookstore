package com.bookstore.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendOrderUpdate(Long userId, String orderNumber, String status) {
        Map<String, Object> payload = Map.of(
            "type", "ORDER_UPDATE",
            "orderNumber", orderNumber,
            "status", status,
            "timestamp", LocalDateTime.now().toString()
        );
        // User-specific notification
        messagingTemplate.convertAndSendToUser(
            userId.toString(), "/queue/notifications", payload
        );
        log.debug("WebSocket order update sent to user {}: {} -> {}", userId, orderNumber, status);
    }

    public void sendStockUpdate(Long bookId, String bookTitle, int stock) {
        Map<String, Object> payload = Map.of(
            "type", "STOCK_UPDATE",
            "bookId", bookId,
            "bookTitle", bookTitle,
            "stock", stock,
            "timestamp", LocalDateTime.now().toString()
        );
        // Broadcast to all subscribers
        messagingTemplate.convertAndSend("/topic/stock", payload);
        log.debug("WebSocket stock update broadcast: {} -> stock={}", bookTitle, stock);
    }

    public void broadcastNotification(String title, String message) {
        Map<String, Object> payload = Map.of(
            "type", "BROADCAST",
            "title", title,
            "message", message,
            "timestamp", LocalDateTime.now().toString()
        );
        messagingTemplate.convertAndSend("/topic/notifications", payload);
        log.debug("Broadcast notification sent: {}", title);
    }

    public void sendUserNotification(Long userId, String title, String message, String type) {
        Map<String, Object> payload = Map.of(
            "type", type,
            "title", title,
            "message", message,
            "timestamp", LocalDateTime.now().toString()
        );
        messagingTemplate.convertAndSendToUser(
            userId.toString(), "/queue/notifications", payload
        );
    }
}

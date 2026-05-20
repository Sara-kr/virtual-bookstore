package com.bookstore.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {

    private final WebSocketNotificationService notificationService;

    @MessageMapping("/ping")
    @SendToUser("/queue/pong")
    public Map<String, String> handlePing(Principal principal) {
        log.debug("WebSocket ping from: {}", principal != null ? principal.getName() : "anonymous");
        return Map.of("message", "pong", "status", "connected");
    }

    @MessageMapping("/subscribe")
    @SendToUser("/queue/notifications")
    public Map<String, String> handleSubscribe(Principal principal) {
        return Map.of("message", "Subscribed to notifications", "user", principal.getName());
    }

    @MessageMapping("/broadcast")
    @SendTo("/topic/notifications")
    public Map<String, Object> handleBroadcast(Map<String, String> payload) {
        return Map.of(
            "type", "BROADCAST",
            "message", payload.getOrDefault("message", ""),
            "from", "system"
        );
    }
}

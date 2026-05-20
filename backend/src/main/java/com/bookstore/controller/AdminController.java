package com.bookstore.controller;

import com.bookstore.dto.response.ApiResponse;
import com.bookstore.dto.response.BookResponse;
import com.bookstore.dto.response.UserResponse;
import com.bookstore.entity.User;
import com.bookstore.enums.RoleType;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.websocket.WebSocketNotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin dashboard and management")
@SecurityRequirement(name = "Bearer Authentication")
public class AdminController {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final BookRepository bookRepository;
    private final WebSocketNotificationService wsNotificationService;

    @GetMapping("/analytics")
    @Operation(summary = "Get dashboard analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        // User stats
        analytics.put("totalUsers", userRepository.count());
        analytics.put("activeUsers", userRepository.countActiveUsers());

        // Order stats
        analytics.put("totalOrders", orderRepository.count());
        List<Object[]> ordersByStatus = orderRepository.countByStatus();
        Map<String, Long> statusMap = ordersByStatus.stream()
            .collect(Collectors.toMap(row -> row[0].toString(), row -> (Long) row[1]));
        analytics.put("ordersByStatus", statusMap);

        // Revenue (last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        BigDecimal revenue = orderRepository.calculateRevenueBetween(thirtyDaysAgo, LocalDateTime.now());
        analytics.put("revenueLastMonth", revenue != null ? revenue : BigDecimal.ZERO);

        // Book stats
        analytics.put("totalBooks", bookRepository.count());
        List<Object[]> booksByCategory = bookRepository.countByCategory();
        Map<String, Long> categoryMap = booksByCategory.stream()
            .collect(Collectors.toMap(row -> row[0].toString(), row -> (Long) row[1]));
        analytics.put("booksByCategory", categoryMap);

        // Low stock alert
        List<String> lowStockBooks = bookRepository.findLowStockBooks(5).stream()
            .map(b -> b.getTitle() + " (" + b.getStock() + " left)")
            .collect(Collectors.toList());
        analytics.put("lowStockAlert", lowStockBooks);

        return ResponseEntity.ok(ApiResponse.success(analytics));
    }

    @GetMapping("/users")
    @Operation(summary = "Get all users")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getUsers(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Page<UserResponse> users = userRepository
            .findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()))
            .map(this::mapUserToResponse);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PutMapping("/users/{userId}/toggle-status")
    @Operation(summary = "Activate/deactivate user account")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserStatus(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(
            "User " + (user.getIsActive() ? "activated" : "deactivated"),
            mapUserToResponse(user)
        ));
    }

    @PostMapping("/broadcast")
    @Operation(summary = "Send broadcast notification to all users")
    public ResponseEntity<ApiResponse<Void>> broadcast(
        @RequestParam String title,
        @RequestParam String message
    ) {
        wsNotificationService.broadcastNotification(title, message);
        return ResponseEntity.ok(ApiResponse.success("Broadcast sent", null));
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Get books with low stock")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getLowStock(
        @RequestParam(defaultValue = "5") int threshold
    ) {
        List<Map<String, Object>> books = bookRepository.findLowStockBooks(threshold).stream()
            .map(book -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", book.getId());
                m.put("title", book.getTitle());
                m.put("author", book.getAuthor());
                m.put("stock", book.getStock());
                m.put("category", book.getCategory());
                return m;
            }).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(books));
    }

    private UserResponse mapUserToResponse(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .isActive(user.getIsActive())
            .roles(user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toSet()))
            .createdAt(user.getCreatedAt())
            .build();
    }
}

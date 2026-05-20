package com.bookstore.service.impl;

import com.bookstore.dto.request.OrderRequest;
import com.bookstore.dto.response.OrderItemResponse;
import com.bookstore.dto.response.OrderResponse;
import com.bookstore.entity.*;
import com.bookstore.enums.NotificationType;
import com.bookstore.enums.OrderStatus;
import com.bookstore.exception.BusinessException;
import com.bookstore.exception.InsufficientStockException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.*;
import com.bookstore.service.NotificationService;
import com.bookstore.service.OrderService;
import com.bookstore.websocket.WebSocketNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final NotificationService notificationService;
    private final WebSocketNotificationService wsNotificationService;

    @Override
    @Transactional
    public OrderResponse placeOrder(Long userId, OrderRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Cart cart = cartRepository.findByUserIdWithItems(userId)
            .orElseThrow(() -> new BusinessException("Cart not found"));

        if (cart.getItems().isEmpty()) {
            throw new BusinessException("Cannot place order with empty cart");
        }

        // Validate stock and calculate total
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartItem item : cart.getItems()) {
            Book book = item.getBook();
            if (book.getStock() < item.getQuantity()) {
                throw new InsufficientStockException(
                    "Insufficient stock for: " + book.getTitle() +
                    ". Available: " + book.getStock()
                );
            }
            totalAmount = totalAmount.add(book.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        // Create order
        Order order = Order.builder()
            .orderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
            .user(user)
            .status(OrderStatus.PENDING)
            .totalAmount(totalAmount)
            .shippingAddress(request.getShippingAddress())
            .paymentMethod(request.getPaymentMethod())
            .notes(request.getNotes())
            .build();

        order = orderRepository.save(order);

        // Create order items and deduct stock
        Order finalOrder = order;
        List<OrderItem> orderItems = cart.getItems().stream().map(cartItem -> {
            Book book = cartItem.getBook();
            book.setStock(book.getStock() - cartItem.getQuantity());
            if (book.getStock() == 0) book.setIsAvailable(false);
            bookRepository.save(book);

            return OrderItem.builder()
                .order(finalOrder)
                .book(book)
                .quantity(cartItem.getQuantity())
                .unitPrice(book.getPrice())
                .build();
        }).collect(Collectors.toList());

        order.setOrderItems(orderItems);
        order = orderRepository.save(order);

        // Clear cart
        cart.getItems().clear();
        cartRepository.save(cart);

        // Send notifications
        notificationService.createNotification(
            userId,
            "Order Placed Successfully",
            "Your order " + order.getOrderNumber() + " has been placed. Total: $" + totalAmount,
            NotificationType.ORDER_PLACED,
            order.getId(),
            "ORDER"
        );

        wsNotificationService.sendOrderUpdate(userId, order.getOrderNumber(), OrderStatus.PENDING.name());
        log.info("Order placed: {} for user: {}", order.getOrderNumber(), userId);

        return mapToResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        // Users can only view their own orders; admins can view all
        if (userId != null && !order.getUser().getId().equals(userId)) {
            throw new BusinessException("Access denied to this order");
        }
        return mapToResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getUserOrders(Long userId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
            .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        validateStatusTransition(order.getStatus(), status);
        order.setStatus(status);
        order = orderRepository.save(order);

        Long userId = order.getUser().getId();
        notificationService.createNotification(
            userId,
            "Order Status Updated",
            "Order " + order.getOrderNumber() + " is now " + status.name(),
            NotificationType.valueOf("ORDER_" + status.name()),
            orderId,
            "ORDER"
        );

        wsNotificationService.sendOrderUpdate(userId, order.getOrderNumber(), status.name());
        log.info("Order {} status updated to {}", order.getOrderNumber(), status);

        return mapToResponse(order);
    }

    @Override
    @Transactional
    public void cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (!order.getUser().getId().equals(userId)) {
            throw new BusinessException("Cannot cancel another user's order");
        }
        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new BusinessException("Cannot cancel an order that has been shipped or delivered");
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessException("Order is already cancelled");
        }

        // Restore stock
        order.getOrderItems().forEach(item -> {
            Book book = item.getBook();
            book.setStock(book.getStock() + item.getQuantity());
            book.setIsAvailable(true);
            bookRepository.save(book);
        });

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        notificationService.createNotification(
            userId,
            "Order Cancelled",
            "Your order " + order.getOrderNumber() + " has been cancelled.",
            NotificationType.ORDER_CANCELLED,
            orderId,
            "ORDER"
        );

        wsNotificationService.sendOrderUpdate(userId, order.getOrderNumber(), "CANCELLED");
        log.info("Order {} cancelled by user {}", order.getOrderNumber(), userId);
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        boolean valid = switch (current) {
            case PENDING -> next == OrderStatus.CONFIRMED || next == OrderStatus.CANCELLED;
            case CONFIRMED -> next == OrderStatus.SHIPPED || next == OrderStatus.CANCELLED;
            case SHIPPED -> next == OrderStatus.DELIVERED;
            default -> false;
        };
        if (!valid) {
            throw new BusinessException("Invalid status transition: " + current + " -> " + next);
        }
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> items = order.getOrderItems().stream().map(item ->
            OrderItemResponse.builder()
                .id(item.getId())
                .bookId(item.getBook().getId())
                .bookTitle(item.getBook().getTitle())
                .bookAuthor(item.getBook().getAuthor())
                .bookImageUrl(item.getBook().getImageUrl())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(item.getSubtotal())
                .build()
        ).collect(Collectors.toList());

        return OrderResponse.builder()
            .id(order.getId())
            .orderNumber(order.getOrderNumber())
            .userId(order.getUser().getId())
            .username(order.getUser().getUsername())
            .orderItems(items)
            .status(order.getStatus())
            .totalAmount(order.getTotalAmount())
            .shippingAddress(order.getShippingAddress())
            .paymentMethod(order.getPaymentMethod())
            .paymentStatus(order.getPaymentStatus())
            .notes(order.getNotes())
            .createdAt(order.getCreatedAt())
            .updatedAt(order.getUpdatedAt())
            .build();
    }
}

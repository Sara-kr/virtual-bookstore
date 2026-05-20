package com.bookstore.service;

import com.bookstore.dto.request.CartItemRequest;
import com.bookstore.dto.response.CartResponse;

public interface CartService {
    CartResponse getCart(Long userId);
    CartResponse addToCart(Long userId, CartItemRequest request);
    CartResponse updateCartItem(Long userId, Long itemId, Integer quantity);
    CartResponse removeFromCart(Long userId, Long itemId);
    void clearCart(Long userId);
}

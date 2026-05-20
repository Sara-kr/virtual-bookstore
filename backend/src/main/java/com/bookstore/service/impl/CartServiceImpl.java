package com.bookstore.service.impl;

import com.bookstore.dto.request.CartItemRequest;
import com.bookstore.dto.response.CartItemResponse;
import com.bookstore.dto.response.CartResponse;
import com.bookstore.entity.*;
import com.bookstore.exception.BusinessException;
import com.bookstore.exception.InsufficientStockException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.*;
import com.bookstore.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return mapToResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addToCart(Long userId, CartItemRequest request) {
        Cart cart = getOrCreateCart(userId);
        Book book = bookRepository.findById(request.getBookId())
            .orElseThrow(() -> new ResourceNotFoundException("Book", request.getBookId()));

        if (!book.getIsAvailable() || book.getStock() < request.getQuantity()) {
            throw new InsufficientStockException("Insufficient stock for: " + book.getTitle());
        }

        Optional<CartItem> existing = cart.getItems().stream()
            .filter(i -> i.getBook().getId().equals(request.getBookId()))
            .findFirst();

        if (existing.isPresent()) {
            CartItem item = existing.get();
            int newQty = item.getQuantity() + request.getQuantity();
            if (newQty > book.getStock()) {
                throw new InsufficientStockException("Only " + book.getStock() + " copies available");
            }
            item.setQuantity(newQty);
        } else {
            CartItem newItem = CartItem.builder()
                .cart(cart)
                .book(book)
                .quantity(request.getQuantity())
                .build();
            cart.getItems().add(newItem);
        }

        cart = cartRepository.save(cart);
        log.debug("Added book {} to cart for user {}", book.getTitle(), userId);
        return mapToResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse updateCartItem(Long userId, Long itemId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cart.getItems().stream()
            .filter(i -> i.getId().equals(itemId))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("CartItem not found with id: " + itemId));

        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            if (quantity > item.getBook().getStock()) {
                throw new InsufficientStockException("Only " + item.getBook().getStock() + " copies available");
            }
            item.setQuantity(quantity);
        }

        cart = cartRepository.save(cart);
        return mapToResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse removeFromCart(Long userId, Long itemId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().removeIf(i -> i.getId().equals(itemId));
        cart = cartRepository.save(cart);
        return mapToResponse(cart);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
            Cart newCart = Cart.builder().user(user).build();
            return cartRepository.save(newCart);
        });
    }

    private CartResponse mapToResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream().map(item ->
            CartItemResponse.builder()
                .id(item.getId())
                .bookId(item.getBook().getId())
                .bookTitle(item.getBook().getTitle())
                .bookAuthor(item.getBook().getAuthor())
                .bookImageUrl(item.getBook().getImageUrl())
                .unitPrice(item.getBook().getPrice())
                .quantity(item.getQuantity())
                .subtotal(item.getSubtotal())
                .availableStock(item.getBook().getStock())
                .build()
        ).collect(Collectors.toList());

        return CartResponse.builder()
            .id(cart.getId())
            .userId(cart.getUser().getId())
            .items(items)
            .totalPrice(cart.getTotalPrice())
            .totalItems(items.stream().mapToInt(CartItemResponse::getQuantity).sum())
            .build();
    }
}

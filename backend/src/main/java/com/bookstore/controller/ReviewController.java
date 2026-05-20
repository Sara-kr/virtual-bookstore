package com.bookstore.controller;

import com.bookstore.dto.response.ApiResponse;
import com.bookstore.entity.Book;
import com.bookstore.entity.Review;
import com.bookstore.entity.User;
import com.bookstore.exception.BusinessException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.ReviewRepository;
import com.bookstore.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Book review and rating system")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    @GetMapping("/book/{bookId}")
    @Operation(summary = "Get reviews for a book")
    public ResponseEntity<ApiResponse<Page<Map<String, Object>>>> getBookReviews(
        @PathVariable Long bookId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        Page<Map<String, Object>> reviews = reviewRepository
            .findByBookIdOrderByCreatedAtDesc(bookId, PageRequest.of(page, size, Sort.by("createdAt").descending()))
            .map(r -> Map.of(
                "id", r.getId(),
                "rating", r.getRating(),
                "comment", r.getComment() != null ? r.getComment() : "",
                "username", r.getUser().getUsername(),
                "createdAt", r.getCreatedAt().toString()
            ));
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @PostMapping("/book/{bookId}")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Add a review to a book")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> addReview(
        @PathVariable Long bookId,
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam @NotNull @Min(1) @Max(5) Integer rating,
        @RequestParam(required = false) String comment
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new ResourceNotFoundException("Book", bookId));

        if (reviewRepository.existsByBookIdAndUserId(bookId, user.getId())) {
            throw new BusinessException("You have already reviewed this book");
        }

        Review review = Review.builder()
            .book(book)
            .user(user)
            .rating(rating)
            .comment(comment)
            .build();
        review = reviewRepository.save(review);

        // Recalculate book rating
        Double avgRating = reviewRepository.calculateAverageRating(bookId);
        Integer reviewCount = reviewRepository.countByBookId(bookId);
        book.setRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        book.setReviewCount(reviewCount != null ? reviewCount : 0);
        bookRepository.save(book);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Review added", Map.of(
            "id", review.getId(),
            "rating", review.getRating(),
            "comment", review.getComment() != null ? review.getComment() : "",
            "username", user.getUsername()
        )));
    }

    @DeleteMapping("/{reviewId}")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Delete your review")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteReview(
        @PathVariable Long reviewId,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new BusinessException("Cannot delete another user's review");
        }

        Long bookId = review.getBook().getId();
        reviewRepository.delete(review);

        // Recalculate rating
        Book book = bookRepository.findById(bookId).orElseThrow();
        Double avgRating = reviewRepository.calculateAverageRating(bookId);
        Integer reviewCount = reviewRepository.countByBookId(bookId);
        book.setRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        book.setReviewCount(reviewCount != null ? reviewCount : 0);
        bookRepository.save(book);

        return ResponseEntity.ok(ApiResponse.success("Review deleted", null));
    }
}

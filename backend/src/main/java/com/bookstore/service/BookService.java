package com.bookstore.service;

import com.bookstore.dto.request.BookRequest;
import com.bookstore.dto.response.BookResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface BookService {
    BookResponse createBook(BookRequest request);
    BookResponse updateBook(Long id, BookRequest request);
    void deleteBook(Long id);
    BookResponse getBookById(Long id);
    Page<BookResponse> getAllBooks(Pageable pageable);
    Page<BookResponse> searchBooks(String query, String category, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
    List<BookResponse> getTopRatedBooks(int limit);
    List<BookResponse> getLatestBooks();
    List<String> getAllCategories();
    void updateStock(Long bookId, int quantity);
}

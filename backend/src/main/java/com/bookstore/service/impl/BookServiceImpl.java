package com.bookstore.service.impl;

import com.bookstore.dto.request.BookRequest;
import com.bookstore.dto.response.BookResponse;
import com.bookstore.entity.Book;
import com.bookstore.exception.InsufficientStockException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.BookRepository;
import com.bookstore.service.BookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;

    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "books", allEntries = true),
        @CacheEvict(value = "topBooks", allEntries = true),
        @CacheEvict(value = "categories", allEntries = true)
    })
    public BookResponse createBook(BookRequest request) {
        Book book = mapToEntity(request);
        book = bookRepository.save(book);
        log.info("Book created: {} by {}", book.getTitle(), book.getAuthor());
        return mapToResponse(book);
    }

    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "book", key = "#id"),
        @CacheEvict(value = "books", allEntries = true),
        @CacheEvict(value = "search", allEntries = true)
    })
    public BookResponse updateBook(Long id, BookRequest request) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Book", id));

        updateEntity(book, request);
        book = bookRepository.save(book);
        log.info("Book updated: {}", book.getTitle());
        return mapToResponse(book);
    }

    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "book", key = "#id"),
        @CacheEvict(value = "books", allEntries = true),
        @CacheEvict(value = "topBooks", allEntries = true)
    })
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Book", id));
        book.setIsAvailable(false);
        bookRepository.save(book);
        log.info("Book soft-deleted: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "book", key = "#id")
    public BookResponse getBookById(Long id) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Book", id));
        return mapToResponse(book);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "books", key = "#pageable.pageNumber + '_' + #pageable.pageSize + '_' + #pageable.sort")
    public Page<BookResponse> getAllBooks(Pageable pageable) {
        return bookRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "search", key = "#query + '_' + #category + '_' + #minPrice + '_' + #maxPrice + '_' + #pageable.pageNumber")
    public Page<BookResponse> searchBooks(String query, String category, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        return bookRepository.findWithFilters(query, category, minPrice, maxPrice, pageable)
            .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "topBooks", key = "#limit")
    public List<BookResponse> getTopRatedBooks(int limit) {
        return bookRepository.findTopRatedBooks(PageRequest.of(0, limit))
            .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookResponse> getLatestBooks() {
        return bookRepository.findTop10ByOrderByCreatedAtDesc()
            .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "categories")
    public List<String> getAllCategories() {
        return bookRepository.findAllCategories();
    }

    @Override
    @Transactional
    @CacheEvict(value = "book", key = "#bookId")
    public void updateStock(Long bookId, int quantity) {
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new ResourceNotFoundException("Book", bookId));
        int newStock = book.getStock() + quantity;
        if (newStock < 0) {
            throw new InsufficientStockException("Insufficient stock for book: " + book.getTitle());
        }
        book.setStock(newStock);
        bookRepository.save(book);
    }

    private Book mapToEntity(BookRequest request) {
        return Book.builder()
            .title(request.getTitle())
            .author(request.getAuthor())
            .category(request.getCategory())
            .price(request.getPrice())
            .stock(request.getStock())
            .description(request.getDescription())
            .imageUrl(request.getImageUrl())
            .publishedDate(request.getPublishedDate())
            .isbn(request.getIsbn())
            .publisher(request.getPublisher())
            .pageCount(request.getPageCount())
            .language(request.getLanguage() != null ? request.getLanguage() : "English")
            .isAvailable(true)
            .build();
    }

    private void updateEntity(Book book, BookRequest request) {
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setCategory(request.getCategory());
        book.setPrice(request.getPrice());
        book.setStock(request.getStock());
        book.setDescription(request.getDescription());
        book.setImageUrl(request.getImageUrl());
        book.setPublishedDate(request.getPublishedDate());
        book.setIsbn(request.getIsbn());
        book.setPublisher(request.getPublisher());
        book.setPageCount(request.getPageCount());
        if (request.getLanguage() != null) book.setLanguage(request.getLanguage());
    }

    public BookResponse mapToResponse(Book book) {
        return BookResponse.builder()
            .id(book.getId())
            .title(book.getTitle())
            .author(book.getAuthor())
            .category(book.getCategory())
            .price(book.getPrice())
            .stock(book.getStock())
            .rating(book.getRating())
            .reviewCount(book.getReviewCount())
            .description(book.getDescription())
            .imageUrl(book.getImageUrl())
            .publishedDate(book.getPublishedDate())
            .isbn(book.getIsbn())
            .publisher(book.getPublisher())
            .pageCount(book.getPageCount())
            .language(book.getLanguage())
            .isAvailable(book.getIsAvailable())
            .createdAt(book.getCreatedAt())
            .updatedAt(book.getUpdatedAt())
            .build();
    }
}

package com.bookstore.service;

import com.bookstore.dto.request.BookRequest;
import com.bookstore.dto.response.BookResponse;
import com.bookstore.entity.Book;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.BookRepository;
import com.bookstore.service.impl.BookServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BookService Unit Tests")
class BookServiceTest {

    @Mock
    private BookRepository bookRepository;

    @InjectMocks
    private BookServiceImpl bookService;

    private Book sampleBook;
    private BookRequest sampleRequest;

    @BeforeEach
    void setUp() {
        sampleBook = Book.builder()
            .id(1L)
            .title("Clean Code")
            .author("Robert C. Martin")
            .category("Programming")
            .price(new BigDecimal("39.99"))
            .stock(50)
            .rating(4.8)
            .reviewCount(100)
            .isAvailable(true)
            .build();

        sampleRequest = BookRequest.builder()
            .title("Clean Code")
            .author("Robert C. Martin")
            .category("Programming")
            .price(new BigDecimal("39.99"))
            .stock(50)
            .build();
    }

    @Test
    @DisplayName("Should return book when found by ID")
    void getBookById_WhenExists_ReturnsBookResponse() {
        when(bookRepository.findById(1L)).thenReturn(Optional.of(sampleBook));

        BookResponse result = bookService.getBookById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Clean Code");
        assertThat(result.getAuthor()).isEqualTo("Robert C. Martin");
        assertThat(result.getPrice()).isEqualByComparingTo("39.99");
        verify(bookRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when book not found")
    void getBookById_WhenNotExists_ThrowsException() {
        when(bookRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookService.getBookById(99L))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("99");

        verify(bookRepository, times(1)).findById(99L);
    }

    @Test
    @DisplayName("Should create book and return response")
    void createBook_WithValidRequest_ReturnsBookResponse() {
        when(bookRepository.save(any(Book.class))).thenReturn(sampleBook);

        BookResponse result = bookService.createBook(sampleRequest);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo(sampleRequest.getTitle());
        assertThat(result.getStock()).isEqualTo(50);
        verify(bookRepository, times(1)).save(any(Book.class));
    }

    @Test
    @DisplayName("Should update book when exists")
    void updateBook_WhenExists_ReturnsUpdatedResponse() {
        BookRequest updateRequest = BookRequest.builder()
            .title("Clean Code - Updated")
            .author("Robert C. Martin")
            .category("Programming")
            .price(new BigDecimal("44.99"))
            .stock(30)
            .build();

        when(bookRepository.findById(1L)).thenReturn(Optional.of(sampleBook));
        when(bookRepository.save(any(Book.class))).thenReturn(sampleBook);

        BookResponse result = bookService.updateBook(1L, updateRequest);

        assertThat(result).isNotNull();
        verify(bookRepository).findById(1L);
        verify(bookRepository).save(any(Book.class));
    }

    @Test
    @DisplayName("Should soft delete book by setting isAvailable=false")
    void deleteBook_WhenExists_SetsUnavailable() {
        when(bookRepository.findById(1L)).thenReturn(Optional.of(sampleBook));
        when(bookRepository.save(any(Book.class))).thenReturn(sampleBook);

        bookService.deleteBook(1L);

        assertThat(sampleBook.getIsAvailable()).isFalse();
        verify(bookRepository).save(sampleBook);
    }

    @Test
    @DisplayName("Should return paginated books")
    void getAllBooks_ReturnsPaginatedResult() {
        Page<Book> bookPage = new PageImpl<>(List.of(sampleBook));
        when(bookRepository.findAll(any(PageRequest.class))).thenReturn(bookPage);

        Page<BookResponse> result = bookService.getAllBooks(PageRequest.of(0, 10));

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Clean Code");
    }

    @Test
    @DisplayName("Should return categories list")
    void getAllCategories_ReturnsDistinctCategories() {
        when(bookRepository.findAllCategories()).thenReturn(List.of("Fiction", "Programming", "Self-Help"));

        List<String> categories = bookService.getAllCategories();

        assertThat(categories).hasSize(3).contains("Fiction", "Programming", "Self-Help");
    }

    @Test
    @DisplayName("Should update stock correctly")
    void updateStock_WithSufficientStock_UpdatesBook() {
        when(bookRepository.findById(1L)).thenReturn(Optional.of(sampleBook));
        when(bookRepository.save(any(Book.class))).thenReturn(sampleBook);

        bookService.updateStock(1L, -10);

        assertThat(sampleBook.getStock()).isEqualTo(40);
        verify(bookRepository).save(sampleBook);
    }

    @Test
    @DisplayName("Should throw exception when stock goes negative")
    void updateStock_WhenInsufficientStock_ThrowsException() {
        when(bookRepository.findById(1L)).thenReturn(Optional.of(sampleBook));

        assertThatThrownBy(() -> bookService.updateStock(1L, -100))
            .isInstanceOf(com.bookstore.exception.InsufficientStockException.class);
    }
}

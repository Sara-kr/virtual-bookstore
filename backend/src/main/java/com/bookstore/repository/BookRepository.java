package com.bookstore.repository;

import com.bookstore.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    // Full-text search across title and author
    @Query("SELECT b FROM Book b WHERE " +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Book> searchBooks(@Param("query") String query, Pageable pageable);

    // Filter by category with pagination
    Page<Book> findByCategoryIgnoreCase(String category, Pageable pageable);

    // Price range filter
    Page<Book> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);

    // Advanced filter combining multiple criteria
    @Query("SELECT b FROM Book b WHERE " +
           "(:category IS NULL OR LOWER(b.category) = LOWER(:category)) AND " +
           "(:minPrice IS NULL OR b.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR b.price <= :maxPrice) AND " +
           "(:query IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "b.isAvailable = true")
    Page<Book> findWithFilters(
        @Param("query") String query,
        @Param("category") String category,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        Pageable pageable
    );

    // Top-rated books
    @Query("SELECT b FROM Book b WHERE b.reviewCount > 0 ORDER BY b.rating DESC")
    List<Book> findTopRatedBooks(Pageable pageable);

    // Latest books
    List<Book> findTop10ByOrderByCreatedAtDesc();

    // Distinct categories
    @Query("SELECT DISTINCT b.category FROM Book b ORDER BY b.category")
    List<String> findAllCategories();

    // Books by author
    Page<Book> findByAuthorContainingIgnoreCase(String author, Pageable pageable);

    // Count by category
    @Query("SELECT b.category, COUNT(b) FROM Book b GROUP BY b.category")
    List<Object[]> countByCategory();

    // Low stock alert
    @Query("SELECT b FROM Book b WHERE b.stock <= :threshold AND b.isAvailable = true")
    List<Book> findLowStockBooks(@Param("threshold") int threshold);
}

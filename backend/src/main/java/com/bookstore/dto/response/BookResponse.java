package com.bookstore.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BookResponse {
    private Long id;
    private String title;
    private String author;
    private String category;
    private BigDecimal price;
    private Integer stock;
    private Double rating;
    private Integer reviewCount;
    private String description;
    private String imageUrl;
    private LocalDate publishedDate;
    private String isbn;
    private String publisher;
    private Integer pageCount;
    private String language;
    private Boolean isAvailable;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

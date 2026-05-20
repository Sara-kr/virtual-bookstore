package com.bookstore.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CartItemRequest {
    @NotNull(message = "Book ID is required")
    private Long bookId;

    @NotNull @Min(1) @Max(99)
    private Integer quantity;
}

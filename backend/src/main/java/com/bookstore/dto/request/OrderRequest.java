package com.bookstore.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderRequest {
    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    private String paymentMethod;
    private String notes;
}

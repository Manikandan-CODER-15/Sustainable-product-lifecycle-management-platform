package com.plm.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRequestDto {

    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "Product category is required")
    private String category;

    @NotEmpty(message = "At least one material is required")
    @Valid
    private List<ProductMaterialRequestDto> materials;
}

package com.plm.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductMaterialRequestDto {

    @NotNull(message = "Material ID is required")
    private Long materialId;

    @NotNull(message = "Weight in grams is required")
    @DecimalMin(value = "0.01", message = "Weight must be greater than 0 grams")
    private Double weightG;
}

package com.plm.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialRequestDto {

    @NotBlank(message = "Material name is required")
    private String name;

    private String typeOrGrade;

    @NotNull(message = "Recyclability percentage is required")
    @DecimalMin(value = "0.0", message = "Recyclability percentage must be at least 0")
    @DecimalMax(value = "100.0", message = "Recyclability percentage cannot exceed 100")
    private Double recyclabilityPct;

    @NotNull(message = "Recycled content percentage is required")
    @DecimalMin(value = "0.0", message = "Recycled content percentage must be at least 0")
    @DecimalMax(value = "100.0", message = "Recycled content percentage cannot exceed 100")
    private Double recycledContentPct;

    @NotNull(message = "Disassembly ease rating is required")
    @Min(value = 1, message = "Disassembly ease rating must be between 1 and 10")
    @Max(value = 10, message = "Disassembly ease rating must be between 1 and 10")
    private Integer disassemblyEase;

    @NotNull(message = "Reusability percentage is required")
    @DecimalMin(value = "0.0", message = "Reusability percentage must be at least 0")
    @DecimalMax(value = "100.0", message = "Reusability percentage cannot exceed 100")
    private Double reusabilityPct;

    @NotNull(message = "Repairability rating is required")
    @Min(value = 1, message = "Repairability rating must be between 1 and 10")
    @Max(value = 10, message = "Repairability rating must be between 1 and 10")
    private Integer repairability;

    @NotNull(message = "Lifetime years is required")
    @DecimalMin(value = "0.0", message = "Lifetime years cannot be negative")
    private Double lifetimeYears;

    private boolean hazardous;

    private Long sourceId;

    private String notes;
}

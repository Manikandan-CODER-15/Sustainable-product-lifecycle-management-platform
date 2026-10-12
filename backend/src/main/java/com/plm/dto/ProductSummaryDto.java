package com.plm.dto;

import lombok.*;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSummaryDto {
    private Long id;
    private String name;
    private String category;
    private Double totalWeightG;
    private Double score;
    private String label;
    private Instant createdAt;
}

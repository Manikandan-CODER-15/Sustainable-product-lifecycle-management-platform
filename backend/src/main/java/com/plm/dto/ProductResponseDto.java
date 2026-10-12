package com.plm.dto;

import lombok.*;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponseDto {
    private Long id;
    private Long userId;
    private String name;
    private String category;
    private Double totalWeightG;
    private Double score;
    private String label;
    private Instant createdAt;
    private ScoreCalculationResult calculationResult;
}

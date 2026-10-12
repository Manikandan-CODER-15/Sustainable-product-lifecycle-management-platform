package com.plm.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialScoreBreakdown {
    private Long materialId;
    private String materialName;
    private Double weightG;
    private Double weightSharePct;
    private boolean hazardous;
    private Double individualScore;
    private String impact; // "POSITIVE", "NEUTRAL", "NEGATIVE"
}

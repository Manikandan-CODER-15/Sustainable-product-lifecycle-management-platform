package com.plm.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScoreCalculationResult {
    private Double score;
    private String label; // "Poor", "Moderate", "Good"
    private Double totalWeightG;
    private Double positiveScore;
    private Double hazardousPenalty;
    private Double hazardousSharePct;
    private Map<String, Double> normalizedAverages;
    private List<MaterialScoreBreakdown> materialBreakdowns;
    private List<String> suggestions;
}

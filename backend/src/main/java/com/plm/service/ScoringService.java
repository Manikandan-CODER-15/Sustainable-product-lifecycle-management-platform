package com.plm.service;

import com.plm.dto.MaterialScoreBreakdown;
import com.plm.dto.MaterialScoreItem;
import com.plm.dto.ScoreCalculationResult;
import com.plm.entity.Material;
import com.plm.entity.ScoringSettings;
import com.plm.exception.BadRequestException;
import com.plm.repository.ScoringSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ScoringService {

    private final ScoringSettingsRepository scoringSettingsRepository;

    public ScoringSettings getActiveSettings() {
        return scoringSettingsRepository.findFirstByOrderByIdAsc()
                .orElseGet(this::getDefaultSettings);
    }

    public ScoreCalculationResult calculate(List<MaterialScoreItem> items) {
        return calculate(items, getActiveSettings());
    }

    public ScoreCalculationResult calculate(List<MaterialScoreItem> items, ScoringSettings settings) {
        if (items == null || items.isEmpty()) {
            throw new BadRequestException("At least one material is required to calculate score");
        }

        double totalWeight = 0.0;
        double hazardousWeight = 0.0;

        // Verify and sum total weight
        for (MaterialScoreItem item : items) {
            if (item.getWeightG() == null || item.getWeightG() <= 0) {
                throw new BadRequestException("Weight must be strictly greater than 0 for all materials");
            }
            if (item.getMaterial() == null) {
                throw new BadRequestException("Material detail cannot be null");
            }
            totalWeight += item.getWeightG();
            if (item.getMaterial().isHazardous()) {
                hazardousWeight += item.getWeightG();
            }
        }

        // Weighted averages for the 6 positive parameters
        double sumRecyclability = 0.0;
        double sumRecycledContent = 0.0;
        double sumDisassembly = 0.0;
        double sumReusability = 0.0;
        double sumRepairability = 0.0;
        double sumLifetime = 0.0;

        for (MaterialScoreItem item : items) {
            Material m = item.getMaterial();
            double w = item.getWeightG();

            sumRecyclability += m.getRecyclabilityPct() * w;
            sumRecycledContent += m.getRecycledContentPct() * w;
            sumDisassembly += (m.getDisassemblyEase() / 10.0 * 100.0) * w;
            sumReusability += m.getReusabilityPct() * w;
            sumRepairability += (m.getRepairability() / 10.0 * 100.0) * w;

            double maxLifetime = settings.getMaxLifetimeYears() > 0 ? settings.getMaxLifetimeYears() : 20.0;
            double normLifetime = Math.min(m.getLifetimeYears() / maxLifetime, 1.0) * 100.0;
            sumLifetime += normLifetime * w;
        }

        double normRecyclability = sumRecyclability / totalWeight;
        double normRecycledContent = sumRecycledContent / totalWeight;
        double normDisassembly = sumDisassembly / totalWeight;
        double normReusability = sumReusability / totalWeight;
        double normRepairability = sumRepairability / totalWeight;
        double normLifetime = sumLifetime / totalWeight;

        // Positive weighted sum
        double positiveScore = (settings.getWeightRecyclability() * normRecyclability)
                + (settings.getWeightRecycledContent() * normRecycledContent)
                + (settings.getWeightDisassembly() * normDisassembly)
                + (settings.getWeightReusability() * normReusability)
                + (settings.getWeightRepairability() * normRepairability)
                + (settings.getWeightLifetime() * normLifetime);

        // Hazardous share and penalty
        double hazardousSharePct = (hazardousWeight / totalWeight) * 100.0;
        double hazardousPenalty = settings.getHazardousPenaltyWeight() * hazardousSharePct;

        // Final score clamped strictly between 0 and 100
        double rawScore = positiveScore - hazardousPenalty;
        double finalScore = Math.max(0.0, Math.min(100.0, rawScore));
        finalScore = round(finalScore, 1);

        // Determine band label based on settings thresholds
        String label;
        if (finalScore <= settings.getThresholdPoorMax()) {
            label = "Poor";
        } else if (finalScore <= settings.getThresholdModerateMax()) {
            label = "Moderate";
        } else {
            label = "Good";
        }

        // Parameter averages map
        Map<String, Double> normalizedAverages = new LinkedHashMap<>();
        normalizedAverages.put("Recyclability", round(normRecyclability, 1));
        normalizedAverages.put("Recycled Content", round(normRecycledContent, 1));
        normalizedAverages.put("Disassembly Ease", round(normDisassembly, 1));
        normalizedAverages.put("Reusability", round(normReusability, 1));
        normalizedAverages.put("Repairability", round(normRepairability, 1));
        normalizedAverages.put("Lifetime", round(normLifetime, 1));

        // Per-material breakdowns
        List<MaterialScoreBreakdown> breakdowns = new ArrayList<>();
        for (MaterialScoreItem item : items) {
            Material m = item.getMaterial();
            double weightShare = (item.getWeightG() / totalWeight) * 100.0;

            double maxLifetime = settings.getMaxLifetimeYears() > 0 ? settings.getMaxLifetimeYears() : 20.0;
            double mNormLifetime = Math.min(m.getLifetimeYears() / maxLifetime, 1.0) * 100.0;

            double matPositive = (settings.getWeightRecyclability() * m.getRecyclabilityPct())
                    + (settings.getWeightRecycledContent() * m.getRecycledContentPct())
                    + (settings.getWeightDisassembly() * (m.getDisassemblyEase() / 10.0 * 100.0))
                    + (settings.getWeightReusability() * m.getReusabilityPct())
                    + (settings.getWeightRepairability() * (m.getRepairability() / 10.0 * 100.0))
                    + (settings.getWeightLifetime() * mNormLifetime);

            double matPenalty = m.isHazardous() ? (settings.getHazardousPenaltyWeight() * 100.0) : 0.0;
            double individualScore = round(Math.max(0.0, Math.min(100.0, matPositive - matPenalty)), 1);

            String impact = individualScore >= 70.0 ? "POSITIVE" : (individualScore <= 40.0 ? "NEGATIVE" : "NEUTRAL");

            breakdowns.add(MaterialScoreBreakdown.builder()
                    .materialId(m.getId())
                    .materialName(m.getName())
                    .weightG(round(item.getWeightG(), 1))
                    .weightSharePct(round(weightShare, 1))
                    .hazardous(m.isHazardous())
                    .individualScore(individualScore)
                    .impact(impact)
                    .build());
        }

        // Rule-based suggestions
        List<String> suggestions = generateSuggestions(items, hazardousSharePct, normRecycledContent, normDisassembly, normRepairability);

        return ScoreCalculationResult.builder()
                .score(finalScore)
                .label(label)
                .totalWeightG(round(totalWeight, 1))
                .positiveScore(round(positiveScore, 1))
                .hazardousPenalty(round(hazardousPenalty, 1))
                .hazardousSharePct(round(hazardousSharePct, 1))
                .normalizedAverages(normalizedAverages)
                .materialBreakdowns(breakdowns)
                .suggestions(suggestions)
                .build();
    }

    private List<String> generateSuggestions(List<MaterialScoreItem> items, double hazardousSharePct,
                                             double normRecycledContent, double normDisassembly, double normRepairability) {
        List<String> suggestions = new ArrayList<>();

        if (hazardousSharePct > 0) {
            suggestions.add(String.format("Hazardous materials account for %.1f%% of total product weight. Consider replacing hazardous elements or designing modular shielding to prevent downcycling.", hazardousSharePct));
        }

        if (normRecycledContent < 30.0) {
            suggestions.add(String.format("Average recycled content is currently low (%.1f%%). Sourcing post-consumer recycled (PCR) feedstocks can significantly elevate the score.", normRecycledContent));
        }

        if (normDisassembly < 60.0) {
            suggestions.add("Disassembly ease is below optimal levels. Consider snap-fits or standardized fasteners instead of permanent adhesives to facilitate end-of-life recovery.");
        }

        if (normRepairability < 60.0) {
            suggestions.add("Repairability rating is low. Providing accessible modular subassemblies and replacement components will improve product longevity.");
        }

        if (suggestions.isEmpty()) {
            suggestions.add("Outstanding eco-design! High material recyclability and non-hazardous composition support circular economy pathways.");
        }

        return suggestions;
    }

    private double round(double value, int places) {
        BigDecimal bd = BigDecimal.valueOf(value);
        bd = bd.setScale(places, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }

    public ScoringSettings getDefaultSettings() {
        return ScoringSettings.builder()
                .weightRecyclability(0.25)
                .weightRecycledContent(0.15)
                .weightDisassembly(0.15)
                .weightReusability(0.15)
                .weightRepairability(0.15)
                .weightLifetime(0.15)
                .hazardousPenaltyWeight(0.30)
                .maxLifetimeYears(20.0)
                .thresholdPoorMax(40.0)
                .thresholdModerateMax(70.0)
                .build();
    }
}

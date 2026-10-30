package com.plm.service;

import com.plm.dto.MaterialScoreItem;
import com.plm.dto.ScoreCalculationResult;
import com.plm.entity.Material;
import com.plm.entity.ScoringSettings;
import com.plm.exception.BadRequestException;
import com.plm.repository.ScoringSettingsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class ScoringServiceTest {

    private ScoringSettingsRepository scoringSettingsRepository;
    private ScoringService scoringService;
    private ScoringSettings settings;

    @BeforeEach
    void setUp() {
        scoringSettingsRepository = (ScoringSettingsRepository) Proxy.newProxyInstance(
                ScoringSettingsRepository.class.getClassLoader(),
                new Class<?>[]{ScoringSettingsRepository.class},
                (proxy, method, args) -> Optional.empty()
        );
        scoringService = new ScoringService(scoringSettingsRepository);
        settings = scoringService.getDefaultSettings();
    }

    @Test
    @DisplayName("Single material product hand-calculated test")
    void testSingleMaterialScore() {
        Material aluminium = Material.builder()
                .id(1L)
                .name("Aluminium")
                .recyclabilityPct(90.0)
                .recycledContentPct(50.0)
                .disassemblyEase(8) // 80%
                .reusabilityPct(70.0)
                .repairability(7)   // 70%
                .lifetimeYears(20.0) // 100%
                .hazardous(false)
                .build();

        MaterialScoreItem item = MaterialScoreItem.builder()
                .material(aluminium)
                .weightG(500.0)
                .build();

        ScoreCalculationResult result = scoringService.calculate(List.of(item), settings);

        // Expected calculation:
        // positive = (0.25*90) + (0.15*50) + (0.15*80) + (0.15*70) + (0.15*70) + (0.15*100)
        // positive = 22.5 + 7.5 + 12.0 + 10.5 + 10.5 + 15.0 = 78.0
        // penalty = 0.30 * 0 = 0.0 -> score = 78.0 -> Good
        assertEquals(78.0, result.getScore(), 0.1);
        assertEquals("Good", result.getLabel());
        assertEquals(500.0, result.getTotalWeightG());
        assertEquals(0.0, result.getHazardousSharePct());
    }

    @Test
    @DisplayName("100% Hazardous material product clamping test")
    void test100PercentHazardousPenalty() {
        Material battery = Material.builder()
                .id(2L)
                .name("Battery Cell")
                .recyclabilityPct(30.0)
                .recycledContentPct(10.0)
                .disassemblyEase(3) // 30%
                .reusabilityPct(10.0)
                .repairability(2)   // 20%
                .lifetimeYears(5.0)  // 25%
                .hazardous(true)
                .build();

        MaterialScoreItem item = MaterialScoreItem.builder()
                .material(battery)
                .weightG(200.0)
                .build();

        ScoreCalculationResult result = scoringService.calculate(List.of(item), settings);

        // positive = (0.25*30) + (0.15*10) + (0.15*30) + (0.15*10) + (0.15*20) + (0.15*25) = 21.75
        // penalty = 0.30 * 100 = 30.0
        // raw = 21.75 - 30.0 = -8.25 -> clamped to 0.0 -> Poor
        assertEquals(0.0, result.getScore(), 0.1);
        assertEquals("Poor", result.getLabel());
        assertEquals(100.0, result.getHazardousSharePct());
    }

    @Test
    @DisplayName("Zero or negative weight rejection")
    void testZeroWeightRejection() {
        Material steel = Material.builder().id(3L).name("Steel").hazardous(false).build();

        MaterialScoreItem zeroWeight = MaterialScoreItem.builder().material(steel).weightG(0.0).build();
        assertThrows(BadRequestException.class, () -> scoringService.calculate(List.of(zeroWeight), settings));

        MaterialScoreItem negativeWeight = MaterialScoreItem.builder().material(steel).weightG(-50.0).build();
        assertThrows(BadRequestException.class, () -> scoringService.calculate(List.of(negativeWeight), settings));
    }

    @Test
    @DisplayName("Empty material list rejection")
    void testEmptyMaterialsRejection() {
        assertThrows(BadRequestException.class, () -> scoringService.calculate(Collections.emptyList(), settings));
    }

    @Test
    @DisplayName("Rule test: higher recycled content never lowers score")
    void testMonotonicityRecycledContent() {
        Material matLow = Material.builder()
                .id(1L).name("Plastic Low")
                .recyclabilityPct(80.0).recycledContentPct(10.0).disassemblyEase(7)
                .reusabilityPct(50.0).repairability(5).lifetimeYears(10.0).hazardous(false).build();

        Material matHigh = Material.builder()
                .id(2L).name("Plastic High")
                .recyclabilityPct(80.0).recycledContentPct(60.0).disassemblyEase(7)
                .reusabilityPct(50.0).repairability(5).lifetimeYears(10.0).hazardous(false).build();

        double scoreLow = scoringService.calculate(List.of(new MaterialScoreItem(matLow, 100.0)), settings).getScore();
        double scoreHigh = scoringService.calculate(List.of(new MaterialScoreItem(matHigh, 100.0)), settings).getScore();

        assertTrue(scoreHigh >= scoreLow, "Higher recycled content must not lower the score");
    }

    @Test
    @DisplayName("Rule test: higher hazardous share never raises score")
    void testMonotonicityHazardousShare() {
        Material safe = Material.builder()
                .id(1L).name("Safe Mat")
                .recyclabilityPct(70.0).recycledContentPct(30.0).disassemblyEase(7)
                .reusabilityPct(50.0).repairability(5).lifetimeYears(10.0).hazardous(false).build();

        Material toxic = Material.builder()
                .id(2L).name("Toxic Mat")
                .recyclabilityPct(70.0).recycledContentPct(30.0).disassemblyEase(7)
                .reusabilityPct(50.0).repairability(5).lifetimeYears(10.0).hazardous(true).build();

        double scoreSafe = scoringService.calculate(List.of(new MaterialScoreItem(safe, 100.0)), settings).getScore();
        double scoreWithToxic = scoringService.calculate(List.of(
                new MaterialScoreItem(safe, 70.0),
                new MaterialScoreItem(toxic, 30.0)
        ), settings).getScore();

        assertTrue(scoreWithToxic <= scoreSafe, "Adding hazardous material must not increase the score");
    }
}

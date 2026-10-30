package com.plm.service;

import com.plm.dto.ScoringSettingsDto;
import com.plm.entity.ScoringSettings;
import com.plm.exception.BadRequestException;
import com.plm.repository.ScoringSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final ScoringSettingsRepository repository;
    private final ScoringService scoringService;

    @Cacheable("settingsDto")
    public ScoringSettingsDto getSettings() {
        ScoringSettings settings = repository.findFirstByOrderByIdAsc()
                .orElseGet(this::createInitialDefault);
        return toDto(settings);
    }

    @CacheEvict(value = "settingsDto", allEntries = true)
    public ScoringSettingsDto updateSettings(ScoringSettingsDto dto) {
        // Enforce rule: sum of positive weights must equal 1.0
        double sum = dto.getWeightRecyclability()
                + dto.getWeightRecycledContent()
                + dto.getWeightDisassembly()
                + dto.getWeightReusability()
                + dto.getWeightRepairability()
                + dto.getWeightLifetime();

        if (Math.abs(sum - 1.0) > 0.001) {
            throw new BadRequestException(String.format("The sum of the 6 positive parameter weights must equal exactly 1.0 (Current sum: %.3f)", sum));
        }

        if (dto.getThresholdPoorMax() >= dto.getThresholdModerateMax()) {
            throw new BadRequestException("Poor threshold maximum must be strictly less than Moderate threshold maximum");
        }

        ScoringSettings settings = repository.findFirstByOrderByIdAsc()
                .orElseGet(ScoringSettings::new);

        settings.setWeightRecyclability(dto.getWeightRecyclability());
        settings.setWeightRecycledContent(dto.getWeightRecycledContent());
        settings.setWeightDisassembly(dto.getWeightDisassembly());
        settings.setWeightReusability(dto.getWeightReusability());
        settings.setWeightRepairability(dto.getWeightRepairability());
        settings.setWeightLifetime(dto.getWeightLifetime());
        settings.setHazardousPenaltyWeight(dto.getHazardousPenaltyWeight());
        settings.setMaxLifetimeYears(dto.getMaxLifetimeYears());
        settings.setThresholdPoorMax(dto.getThresholdPoorMax());
        settings.setThresholdModerateMax(dto.getThresholdModerateMax());
        settings.setUpdatedAt(Instant.now());

        ScoringSettingsDto result = toDto(repository.save(settings));

        // Invalidate cached scoring settings so next calculation uses updated values
        scoringService.evictSettingsCache();

        return result;
    }

    private ScoringSettings createInitialDefault() {
        ScoringSettings s = ScoringSettings.builder()
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
        return repository.save(s);
    }

    private ScoringSettingsDto toDto(ScoringSettings s) {
        return ScoringSettingsDto.builder()
                .id(s.getId())
                .weightRecyclability(s.getWeightRecyclability())
                .weightRecycledContent(s.getWeightRecycledContent())
                .weightDisassembly(s.getWeightDisassembly())
                .weightReusability(s.getWeightReusability())
                .weightRepairability(s.getWeightRepairability())
                .weightLifetime(s.getWeightLifetime())
                .hazardousPenaltyWeight(s.getHazardousPenaltyWeight())
                .maxLifetimeYears(s.getMaxLifetimeYears())
                .thresholdPoorMax(s.getThresholdPoorMax())
                .thresholdModerateMax(s.getThresholdModerateMax())
                .build();
    }
}

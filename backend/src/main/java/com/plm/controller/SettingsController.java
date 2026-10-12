package com.plm.controller;

import com.plm.dto.ScoringSettingsDto;
import com.plm.service.SettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping
    public ResponseEntity<ScoringSettingsDto> getSettings() {
        return ResponseEntity.ok(settingsService.getSettings());
    }

    @PutMapping
    public ResponseEntity<ScoringSettingsDto> updateSettings(@Valid @RequestBody ScoringSettingsDto dto) {
        return ResponseEntity.ok(settingsService.updateSettings(dto));
    }
}

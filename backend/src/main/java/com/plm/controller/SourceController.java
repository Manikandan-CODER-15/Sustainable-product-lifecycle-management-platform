package com.plm.controller;

import com.plm.dto.SourceDto;
import com.plm.service.SourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sources")
@RequiredArgsConstructor
public class SourceController {

    private final SourceService sourceService;

    @GetMapping
    public ResponseEntity<List<SourceDto>> getAllSources() {
        return ResponseEntity.ok(sourceService.getAllSources());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SourceDto> getSourceById(@PathVariable Long id) {
        return ResponseEntity.ok(sourceService.getSourceById(id));
    }

    @PostMapping
    public ResponseEntity<SourceDto> createSource(@Valid @RequestBody SourceDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sourceService.createSource(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SourceDto> updateSource(@PathVariable Long id, @Valid @RequestBody SourceDto dto) {
        return ResponseEntity.ok(sourceService.updateSource(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSource(@PathVariable Long id) {
        sourceService.deleteSource(id);
        return ResponseEntity.noContent().build();
    }
}

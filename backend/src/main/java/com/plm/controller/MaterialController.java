package com.plm.controller;

import com.plm.dto.MaterialRequestDto;
import com.plm.dto.MaterialResponseDto;
import com.plm.service.MaterialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/materials")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @GetMapping
    public ResponseEntity<List<MaterialResponseDto>> getAllMaterials() {
        return ResponseEntity.ok(materialService.getAllMaterials());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaterialResponseDto> getMaterialById(@PathVariable Long id) {
        return ResponseEntity.ok(materialService.getMaterialById(id));
    }

    @PostMapping
    public ResponseEntity<MaterialResponseDto> createMaterial(@Valid @RequestBody MaterialRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(materialService.createMaterial(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaterialResponseDto> updateMaterial(@PathVariable Long id, @Valid @RequestBody MaterialRequestDto dto) {
        return ResponseEntity.ok(materialService.updateMaterial(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importMaterials(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(materialService.importMaterialsFromCsv(file));
    }
}

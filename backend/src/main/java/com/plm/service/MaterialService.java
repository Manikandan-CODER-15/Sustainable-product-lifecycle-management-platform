package com.plm.service;

import com.plm.dto.MaterialRequestDto;
import com.plm.dto.MaterialResponseDto;
import com.plm.entity.Material;
import com.plm.entity.Source;
import com.plm.exception.BadRequestException;
import com.plm.exception.ResourceNotFoundException;
import com.plm.repository.MaterialRepository;
import com.plm.repository.SourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final SourceRepository sourceRepository;

    public List<MaterialResponseDto> getAllMaterials() {
        return materialRepository.findAllByOrderByNameAsc().stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    public MaterialResponseDto getMaterialById(Long id) {
        return materialRepository.findById(id)
                .map(this::toResponseDto)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + id));
    }

    public MaterialResponseDto createMaterial(MaterialRequestDto dto) {
        if (materialRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Material with name '" + dto.getName() + "' already exists");
        }

        Source source = null;
        if (dto.getSourceId() != null) {
            source = sourceRepository.findById(dto.getSourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Source not found with id: " + dto.getSourceId()));
        }

        Material material = Material.builder()
                .name(dto.getName())
                .typeOrGrade(dto.getTypeOrGrade())
                .recyclabilityPct(dto.getRecyclabilityPct())
                .recycledContentPct(dto.getRecycledContentPct())
                .disassemblyEase(dto.getDisassemblyEase())
                .reusabilityPct(dto.getReusabilityPct())
                .repairability(dto.getRepairability())
                .lifetimeYears(dto.getLifetimeYears())
                .hazardous(dto.isHazardous())
                .source(source)
                .notes(dto.getNotes())
                .build();

        return toResponseDto(materialRepository.save(material));
    }

    public MaterialResponseDto updateMaterial(Long id, MaterialRequestDto dto) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + id));

        // Check if updating name collides with another material
        if (!material.getName().equalsIgnoreCase(dto.getName()) && materialRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Material with name '" + dto.getName() + "' already exists");
        }

        Source source = null;
        if (dto.getSourceId() != null) {
            source = sourceRepository.findById(dto.getSourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Source not found with id: " + dto.getSourceId()));
        }

        material.setName(dto.getName());
        material.setTypeOrGrade(dto.getTypeOrGrade());
        material.setRecyclabilityPct(dto.getRecyclabilityPct());
        material.setRecycledContentPct(dto.getRecycledContentPct());
        material.setDisassemblyEase(dto.getDisassemblyEase());
        material.setReusabilityPct(dto.getReusabilityPct());
        material.setRepairability(dto.getRepairability());
        material.setLifetimeYears(dto.getLifetimeYears());
        material.setHazardous(dto.isHazardous());
        material.setSource(source);
        material.setNotes(dto.getNotes());

        return toResponseDto(materialRepository.save(material));
    }

    public void deleteMaterial(Long id) {
        if (!materialRepository.existsById(id)) {
            throw new ResourceNotFoundException("Material not found with id: " + id);
        }
        materialRepository.deleteById(id);
    }

    public Map<String, Object> importMaterialsFromCsv(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded CSV file is empty");
        }

        int importedCount = 0;
        int updatedCount = 0;
        List<String> errors = new ArrayList<>();

        Source placeholderSource = sourceRepository.findAll().stream().findFirst().orElse(null);

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine(); // skip header
            if (headerLine == null) {
                throw new BadRequestException("CSV file contains no rows");
            }

            String line;
            int lineNumber = 1;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (line.trim().isEmpty()) continue;

                // Support comma-separated values (simple parse)
                String[] parts = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", -1);
                if (parts.length < 9) {
                    errors.add("Row " + lineNumber + ": Insufficient columns");
                    continue;
                }

                try {
                    String name = parts[0].trim().replace("\"", "");
                    String typeOrGrade = parts[1].trim().replace("\"", "");
                    double recyclability = Double.parseDouble(parts[2].trim());
                    double recycledContent = Double.parseDouble(parts[3].trim());
                    int disassembly = Integer.parseInt(parts[4].trim());
                    double reusability = Double.parseDouble(parts[5].trim());
                    int repairability = Integer.parseInt(parts[6].trim());
                    double lifetime = Double.parseDouble(parts[7].trim());
                    boolean hazardous = Boolean.parseBoolean(parts[8].trim());

                    String notes = parts.length > 9 ? parts[9].trim().replace("\"", "") : "";

                    Optional<Material> existingOpt = materialRepository.findByName(name);
                    Material mat;
                    if (existingOpt.isPresent()) {
                        mat = existingOpt.get();
                        updatedCount++;
                    } else {
                        mat = new Material();
                        mat.setName(name);
                        importedCount++;
                    }

                    mat.setTypeOrGrade(typeOrGrade);
                    mat.setRecyclabilityPct(recyclability);
                    mat.setRecycledContentPct(recycledContent);
                    mat.setDisassemblyEase(disassembly);
                    mat.setReusabilityPct(reusability);
                    mat.setRepairability(repairability);
                    mat.setLifetimeYears(lifetime);
                    mat.setHazardous(hazardous);
                    mat.setSource(placeholderSource);
                    mat.setNotes(notes);

                    materialRepository.save(mat);
                } catch (Exception e) {
                    errors.add("Row " + lineNumber + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            throw new BadRequestException("Failed to read CSV: " + e.getMessage());
        }

        Map<String, Object> result = new HashMap<>();
        result.put("imported", importedCount);
        result.put("updated", updatedCount);
        result.put("errors", errors);
        return result;
    }

    public MaterialResponseDto toResponseDto(Material material) {
        return MaterialResponseDto.builder()
                .id(material.getId())
                .name(material.getName())
                .typeOrGrade(material.getTypeOrGrade())
                .recyclabilityPct(material.getRecyclabilityPct())
                .recycledContentPct(material.getRecycledContentPct())
                .disassemblyEase(material.getDisassemblyEase())
                .reusabilityPct(material.getReusabilityPct())
                .repairability(material.getRepairability())
                .lifetimeYears(material.getLifetimeYears())
                .hazardous(material.isHazardous())
                .sourceId(material.getSource() != null ? material.getSource().getId() : null)
                .sourceTitle(material.getSource() != null ? material.getSource().getTitle() : null)
                .notes(material.getNotes())
                .build();
    }
}

package com.plm.service;

import com.plm.dto.SourceDto;
import com.plm.entity.Source;
import com.plm.exception.ResourceNotFoundException;
import com.plm.repository.SourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SourceService {

    private final SourceRepository sourceRepository;

    @Cacheable("sources")
    public List<SourceDto> getAllSources() {
        return sourceRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public SourceDto getSourceById(Long id) {
        return sourceRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Source not found with id: " + id));
    }

    @CacheEvict(value = "sources", allEntries = true)
    public SourceDto createSource(SourceDto dto) {
        Source source = Source.builder()
                .title(dto.getTitle())
                .publisher(dto.getPublisher())
                .year(dto.getYear())
                .linkOrFilePath(dto.getLinkOrFilePath())
                .pageReference(dto.getPageReference())
                .build();
        return toDto(sourceRepository.save(source));
    }

    @CacheEvict(value = "sources", allEntries = true)
    public SourceDto updateSource(Long id, SourceDto dto) {
        Source source = sourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Source not found with id: " + id));

        source.setTitle(dto.getTitle());
        source.setPublisher(dto.getPublisher());
        source.setYear(dto.getYear());
        source.setLinkOrFilePath(dto.getLinkOrFilePath());
        source.setPageReference(dto.getPageReference());

        return toDto(sourceRepository.save(source));
    }

    @CacheEvict(value = "sources", allEntries = true)
    public void deleteSource(Long id) {
        if (!sourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Source not found with id: " + id);
        }
        sourceRepository.deleteById(id);
    }

    private SourceDto toDto(Source source) {
        return SourceDto.builder()
                .id(source.getId())
                .title(source.getTitle())
                .publisher(source.getPublisher())
                .year(source.getYear())
                .linkOrFilePath(source.getLinkOrFilePath())
                .pageReference(source.getPageReference())
                .build();
    }
}

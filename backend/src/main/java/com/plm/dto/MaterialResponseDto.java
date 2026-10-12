package com.plm.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialResponseDto {
    private Long id;
    private String name;
    private String typeOrGrade;
    private Double recyclabilityPct;
    private Double recycledContentPct;
    private Integer disassemblyEase;
    private Double reusabilityPct;
    private Integer repairability;
    private Double lifetimeYears;
    private boolean hazardous;
    private Long sourceId;
    private String sourceTitle;
    private String notes;
}

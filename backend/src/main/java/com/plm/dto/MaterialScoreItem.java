package com.plm.dto;

import com.plm.entity.Material;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialScoreItem {
    private Material material;
    private Double weightG;
}

package com.plm.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScoringSettingsDto {

    private Long id;

    @NotNull(message = "Weight recyclability is required")
    @DecimalMin("0.0") @DecimalMax("1.0")
    private Double weightRecyclability;

    @NotNull(message = "Weight recycled content is required")
    @DecimalMin("0.0") @DecimalMax("1.0")
    private Double weightRecycledContent;

    @NotNull(message = "Weight disassembly is required")
    @DecimalMin("0.0") @DecimalMax("1.0")
    private Double weightDisassembly;

    @NotNull(message = "Weight reusability is required")
    @DecimalMin("0.0") @DecimalMax("1.0")
    private Double weightReusability;

    @NotNull(message = "Weight repairability is required")
    @DecimalMin("0.0") @DecimalMax("1.0")
    private Double weightRepairability;

    @NotNull(message = "Weight lifetime is required")
    @DecimalMin("0.0") @DecimalMax("1.0")
    private Double weightLifetime;

    @NotNull(message = "Hazardous penalty weight is required")
    @DecimalMin("0.0") @DecimalMax("1.0")
    private Double hazardousPenaltyWeight;

    @NotNull(message = "Max lifetime years is required")
    @DecimalMin("1.0")
    private Double maxLifetimeYears;

    @NotNull(message = "Poor threshold maximum is required")
    @DecimalMin("1.0") @DecimalMax("99.0")
    private Double thresholdPoorMax;

    @NotNull(message = "Moderate threshold maximum is required")
    @DecimalMin("1.0") @DecimalMax("99.0")
    private Double thresholdModerateMax;
}

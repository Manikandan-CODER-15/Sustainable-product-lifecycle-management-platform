package com.plm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "scoring_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScoringSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "weight_recyclability", nullable = false)
    private Double weightRecyclability;

    @Column(name = "weight_recycled_content", nullable = false)
    private Double weightRecycledContent;

    @Column(name = "weight_disassembly", nullable = false)
    private Double weightDisassembly;

    @Column(name = "weight_reusability", nullable = false)
    private Double weightReusability;

    @Column(name = "weight_repairability", nullable = false)
    private Double weightRepairability;

    @Column(name = "weight_lifetime", nullable = false)
    private Double weightLifetime;

    @Column(name = "hazardous_penalty_weight", nullable = false)
    private Double hazardousPenaltyWeight;

    @Column(name = "max_lifetime_years", nullable = false)
    @Builder.Default
    private Double maxLifetimeYears = 20.0;

    @Column(name = "threshold_poor_max", nullable = false)
    @Builder.Default
    private Double thresholdPoorMax = 40.0;

    @Column(name = "threshold_moderate_max", nullable = false)
    @Builder.Default
    private Double thresholdModerateMax = 70.0;

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();
}

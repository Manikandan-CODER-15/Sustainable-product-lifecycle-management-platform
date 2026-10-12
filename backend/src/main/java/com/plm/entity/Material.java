package com.plm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "materials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "type_or_grade", length = 100)
    private String typeOrGrade;

    @Column(name = "recyclability_pct", nullable = false)
    private Double recyclabilityPct;

    @Column(name = "recycled_content_pct", nullable = false)
    private Double recycledContentPct;

    @Column(name = "disassembly_ease", nullable = false)
    private Integer disassemblyEase;

    @Column(name = "reusability_pct", nullable = false)
    private Double reusabilityPct;

    @Column(name = "repairability", nullable = false)
    private Integer repairability;

    @Column(name = "lifetime_years", nullable = false)
    private Double lifetimeYears;

    @Column(nullable = false)
    @Builder.Default
    private boolean hazardous = false;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "source_id")
    private Source source;

    @Column(columnDefinition = "TEXT")
    private String notes;
}

package com.plm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "lifecycle_stages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LifecycleStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, length = 50)
    private String stage;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(name = "stage_date")
    @Builder.Default
    private Instant stageDate = Instant.now();

    @Column(columnDefinition = "TEXT")
    private String notes;
}

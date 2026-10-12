package com.plm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Source {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 150)
    private String publisher;

    private Integer year;

    @Column(name = "link_or_file_path", columnDefinition = "TEXT")
    private String linkOrFilePath;

    @Column(name = "page_reference", length = 100)
    private String pageReference;
}

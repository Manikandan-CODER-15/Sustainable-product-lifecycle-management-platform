package com.plm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SourceDto {
    private Long id;

    @NotBlank(message = "Source title is required")
    private String title;

    private String publisher;
    private Integer year;
    private String linkOrFilePath;
    private String pageReference;
}

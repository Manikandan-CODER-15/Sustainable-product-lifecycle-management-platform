package com.plm.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponseDto {
    private String token;
    @Builder.Default
    private String tokenType = "Bearer";
    private Long userId;
    private String name;
    private String email;
    private String role;
}

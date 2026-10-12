package com.plm.dto;

import com.plm.entity.Role;
import lombok.*;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDto {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private boolean active;
    private Instant createdAt;
}

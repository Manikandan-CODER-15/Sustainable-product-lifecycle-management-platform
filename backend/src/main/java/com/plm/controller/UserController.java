package com.plm.controller;

import com.plm.dto.UserResponseDto;
import com.plm.entity.Role;
import com.plm.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<UserResponseDto> updateUserStatus(@PathVariable Long id, @RequestParam boolean active) {
        return ResponseEntity.ok(userService.updateUserStatus(id, active));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<UserResponseDto> updateUserRole(@PathVariable Long id, @RequestParam Role role) {
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }
}

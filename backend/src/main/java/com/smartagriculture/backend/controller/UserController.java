package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.dto.AdminUserResponse;
import com.smartagriculture.backend.service.AdminUserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AdminUserService adminUserService;

    public UserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    // ==========================================
    // DANH SÁCH FARMER
    // GET /api/users/farmers
    // ==========================================
    @GetMapping("/farmers")
    public ResponseEntity<List<AdminUserResponse>> getFarmers() {

        return ResponseEntity.ok(
                adminUserService.getAllFarmers()
        );
    }

    // ==========================================
    // TÌM KIẾM FARMER
    // GET /api/users/farmers/search?keyword=abc
    // ==========================================
    @GetMapping("/farmers/search")
    public ResponseEntity<List<AdminUserResponse>> searchFarmers(
            @RequestParam String keyword) {

        return ResponseEntity.ok(
                adminUserService.searchFarmers(keyword)
        );
    }

    // ==========================================
    // KHÓA FARMER
    // PUT /api/users/{id}/lock
    // ==========================================
    @PutMapping("/{id}/lock")
    public ResponseEntity<AdminUserResponse> lockUser(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                adminUserService.lockFarmer(id)
        );
    }

    // ==========================================
    // MỞ KHÓA FARMER
    // PUT /api/users/{id}/unlock
    // ==========================================
    @PutMapping("/{id}/unlock")
    public ResponseEntity<AdminUserResponse> unlockUser(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                adminUserService.unlockFarmer(id)
        );
    }

    // ==========================================
    // XÓA FARMER
    // DELETE /api/users/{id}
    // ==========================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id) {

        adminUserService.deleteFarmer(id);

        return ResponseEntity.noContent().build();
    }
}
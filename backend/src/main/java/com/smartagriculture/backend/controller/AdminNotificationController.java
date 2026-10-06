package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.dto.AdminNotificationResponse;
import com.smartagriculture.backend.entity.Notification;
import com.smartagriculture.backend.service.AdminNotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/notifications")
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
public class AdminNotificationController {

    private final AdminNotificationService adminNotificationService;

    public AdminNotificationController(
            AdminNotificationService adminNotificationService) {
        this.adminNotificationService = adminNotificationService;
    }

    // Admin xem tất cả thông báo
    @GetMapping
    public List<AdminNotificationResponse> getAll() {
        return adminNotificationService.getAll();
    }

    // Admin xem thông báo theo ID
    @GetMapping("/{id}")
    public AdminNotificationResponse getById(
            @PathVariable Long id) {

        return adminNotificationService.getById(id);
    }

    // Admin tạo thông báo
    @PostMapping
    public ResponseEntity<AdminNotificationResponse> create(
            @RequestBody Notification notification) {

        return ResponseEntity.ok(
                adminNotificationService.create(notification)
        );
    }

    // Admin xóa thông báo
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        adminNotificationService.delete(id);

        return ResponseEntity.noContent().build();
    }
}
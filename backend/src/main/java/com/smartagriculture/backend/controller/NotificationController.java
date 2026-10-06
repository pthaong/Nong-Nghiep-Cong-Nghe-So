package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.entity.Notification;
import com.smartagriculture.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // GET /api/notifications/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getByUser(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                notificationService.getByUserId(userId)
        );
    }

    // GET /api/notifications/user/{userId}/unread
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<Notification>> getUnread(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                notificationService.getUnread(userId)
        );
    }

    // GET /api/notifications/user/{userId}/unread-count
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> countUnread(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                Map.of(
                        "count",
                        notificationService.countUnread(userId)
                )
        );
    }

    // GET /api/notifications/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Notification> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                notificationService.getById(id)
        );
    }

    // POST /api/notifications
    @PostMapping
    public ResponseEntity<Notification> create(
            @RequestBody Notification notification) {

        return ResponseEntity.ok(
                notificationService.create(notification)
        );
    }

    // PUT /api/notifications/{id}/read
    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                notificationService.markAsRead(id)
        );
    }

    // PUT /api/notifications/user/{userId}/read-all
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @PathVariable Long userId) {

        notificationService.markAllAsRead(userId);

        return ResponseEntity.noContent().build();
    }

    // DELETE /api/notifications/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        notificationService.delete(id);

        return ResponseEntity.noContent().build();
    }
}
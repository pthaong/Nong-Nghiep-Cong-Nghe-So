package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.entity.DiagnosisHistory;
import com.smartagriculture.backend.service.DiagnosisHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diagnosis/history")
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
public class DiagnosisHistoryController {

    private final DiagnosisHistoryService service;

    public DiagnosisHistoryController(
            DiagnosisHistoryService service) {
        this.service = service;
    }

    // =========================
    // 1. LẤY TẤT CẢ LỊCH SỬ
    // GET /api/diagnosis/history
    // =========================
    @GetMapping
    public ResponseEntity<List<DiagnosisHistory>> getAll() {

        return ResponseEntity.ok(
                service.getAll()
        );
    }

    // =========================
    // 2. LẤY LỊCH SỬ THEO USER
    // GET /api/diagnosis/history/user/1
    // =========================
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DiagnosisHistory>> getByUserId(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                service.getByUserId(userId)
        );
    }

    // =========================
    // 3. XEM CHI TIẾT
    // GET /api/diagnosis/history/1
    // =========================
    @GetMapping("/{id}")
    public ResponseEntity<DiagnosisHistory> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                service.getById(id)
        );
    }

    // =========================
    // 4. XÓA LỊCH SỬ
    // DELETE /api/diagnosis/history/1
    // =========================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        service.delete(id);

        return ResponseEntity.noContent().build();
    }
}


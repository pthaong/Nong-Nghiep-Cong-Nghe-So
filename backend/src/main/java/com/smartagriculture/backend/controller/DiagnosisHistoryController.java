package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.entity.DiagnosisHistory;
import com.smartagriculture.backend.service.DiagnosisHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diagnosis-history")
@CrossOrigin(origins = "*")
public class DiagnosisHistoryController {

    private final DiagnosisHistoryService service;

    public DiagnosisHistoryController(
            DiagnosisHistoryService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<DiagnosisHistory>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiagnosisHistory> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<DiagnosisHistory> create(
            @RequestBody DiagnosisHistory history) {

        return ResponseEntity.ok(service.save(history));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        service.delete(id);

        return ResponseEntity.noContent().build();
    }
}
package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.dto.DiagnosisRequest;
import com.smartagriculture.backend.dto.DiagnosisResponse;
import com.smartagriculture.backend.entity.DiagnosisHistory;
import com.smartagriculture.backend.service.DiagnosisHistoryService;
import com.smartagriculture.backend.service.DiagnosisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diagnosis")
@CrossOrigin(origins = "*")
public class DiagnosisController {

    private final DiagnosisService diagnosisService;
    private final DiagnosisHistoryService historyService;

    public DiagnosisController(
            DiagnosisService diagnosisService,
            DiagnosisHistoryService historyService) {

        this.diagnosisService = diagnosisService;
        this.historyService = historyService;
    }

    // API chẩn đoán
    @PostMapping
    public ResponseEntity<DiagnosisResponse> diagnose(
            @RequestBody DiagnosisRequest request) {

        return ResponseEntity.ok(
                diagnosisService.diagnose(request)
        );
    }

    // API lưu lịch sử
    @PostMapping("/history")
    public ResponseEntity<DiagnosisHistory> saveHistory(
            @RequestBody DiagnosisHistory history) {

        return ResponseEntity.ok(
                historyService.save(history)
        );
    }

    // API xem lịch sử
    @GetMapping("/history")
    public ResponseEntity<List<DiagnosisHistory>> getHistory() {

        return ResponseEntity.ok(
                historyService.getAll()
        );
    }
}
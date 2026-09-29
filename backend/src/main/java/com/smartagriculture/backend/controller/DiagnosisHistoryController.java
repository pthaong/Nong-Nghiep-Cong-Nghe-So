package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.entity.DiagnosisHistory;
import com.smartagriculture.backend.service.DiagnosisHistoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diagnosis/history")
public class DiagnosisHistoryController {

private final DiagnosisHistoryService historyService;

public DiagnosisHistoryController(
        DiagnosisHistoryService historyService) {

    this.historyService = historyService;
}

/**
 * GET /api/diagnosis/history/user/{userId}
 *
 * Lấy lịch sử chẩn đoán của user.
 */
@GetMapping("/user/{userId}")
public List<DiagnosisHistory> getHistoryByUser(
        @PathVariable Long userId) {

    return historyService.getByUserId(userId);
}

/**
 * GET /api/diagnosis/history/{id}
 *
 * Xem chi tiết một lần chẩn đoán.
 */
@GetMapping("/{id}")
public DiagnosisHistory getHistoryDetail(
        @PathVariable Long id) {

    return historyService.getById(id);
}

}
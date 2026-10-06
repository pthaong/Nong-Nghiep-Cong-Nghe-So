package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.dto.AdminDiagnosisResponse;
import com.smartagriculture.backend.service.AdminDiagnosisService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
@RequestMapping("/api/admin/diagnoses")
public class AdminDiagnosisController {

    private final AdminDiagnosisService adminDiagnosisService;

    public AdminDiagnosisController(
            AdminDiagnosisService adminDiagnosisService) {

        this.adminDiagnosisService = adminDiagnosisService;
    }

    @GetMapping
    public List<AdminDiagnosisResponse> getAll() {
        return adminDiagnosisService.getAll();
    }

    @GetMapping("/{id}")
    public AdminDiagnosisResponse getById(
            @PathVariable Long id) {

        return adminDiagnosisService.getById(id);
    }
}
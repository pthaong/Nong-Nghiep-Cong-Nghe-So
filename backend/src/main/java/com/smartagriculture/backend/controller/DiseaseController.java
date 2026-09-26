package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.entity.Disease;
import com.smartagriculture.backend.service.DiseaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diseases")
public class DiseaseController {

    private final DiseaseService diseaseService;

    public DiseaseController(DiseaseService diseaseService) {
        this.diseaseService = diseaseService;
    }

    @GetMapping
    public ResponseEntity<List<Disease>> getAllDiseases() {
        return ResponseEntity.ok(
                diseaseService.getAllDiseases()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Disease> getDiseaseById(
            @PathVariable Long id) {

        return diseaseService.getDiseaseById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
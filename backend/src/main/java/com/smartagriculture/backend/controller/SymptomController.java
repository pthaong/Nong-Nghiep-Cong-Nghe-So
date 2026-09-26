package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.entity.Symptom;
import com.smartagriculture.backend.service.SymptomService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/symptoms")
public class SymptomController {

    private final SymptomService symptomService;

    public SymptomController(SymptomService symptomService) {
        this.symptomService = symptomService;
    }

    @GetMapping
    public List<Symptom> getAllSymptoms() {
        return symptomService.getAllSymptoms();
    }
}
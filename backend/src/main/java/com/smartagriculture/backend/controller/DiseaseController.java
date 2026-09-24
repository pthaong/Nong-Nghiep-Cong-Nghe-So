package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.entity.Disease;
import com.smartagriculture.backend.service.DiseaseService;
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
    public List<Disease> getAll() {
        return diseaseService.getAll();
    }

    @GetMapping("/{id}")
    public Disease getById(@PathVariable Long id) {
        return diseaseService.getById(id);
    }

    @PostMapping
    public Disease create(@RequestBody Disease disease) {
        return diseaseService.create(disease);
    }

    @PutMapping("/{id}")
    public Disease update(
            @PathVariable Long id,
            @RequestBody Disease disease) {

        return diseaseService.update(id, disease);
    }
// =========================
// ADD SYMPTOM TO DISEASE
// =========================
@PutMapping("/{diseaseId}/symptoms/{symptomId}")
public Disease addSymptom(
        @PathVariable Long diseaseId,
        @PathVariable Long symptomId) {

    return diseaseService.addSymptom(diseaseId, symptomId);
}
// =========================
// REMOVE SYMPTOM FROM DISEASE
// =========================
@DeleteMapping("/{diseaseId}/symptoms/{symptomId}")
public Disease removeSymptom(
        @PathVariable Long diseaseId,
        @PathVariable Long symptomId) {

    return diseaseService.removeSymptom(diseaseId, symptomId);
}
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {

        diseaseService.delete(id);

        return "Xóa bệnh thành công";
    }
}
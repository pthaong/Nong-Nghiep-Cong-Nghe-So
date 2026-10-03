package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.entity.Crop;
import com.smartagriculture.backend.service.CropService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/crops")
@CrossOrigin(origins = {
        "http://localhost:5500",
        "http://127.0.0.1:5500"
})
public class CropController {

    private final CropService cropService;

    public CropController(CropService cropService) {
        this.cropService = cropService;
    }

    // =========================
    // GET ALL
    // GET /api/crops
    // =========================
    @GetMapping
    public ResponseEntity<List<Crop>> getAllCrops() {
        return ResponseEntity.ok(cropService.getAllCrops());
    }

    // =========================
    // GET BY ID
    // GET /api/crops/{id}
    // =========================
    @GetMapping("/{id}")
    public ResponseEntity<Crop> getCropById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                cropService.getCropById(id)
        );
    }

    // =========================
    // SEARCH BY NAME
    // GET /api/crops/search?name=rice
    // =========================
    @GetMapping("/search")
    public ResponseEntity<List<Crop>> searchByName(
            @RequestParam String name) {

        return ResponseEntity.ok(
                cropService.searchByName(name)
        );
    }

    // =========================
    // FILTER BY PLANT TYPE
    // GET /api/crops/type?plantType=...
    // =========================
    @GetMapping("/type")
    public ResponseEntity<List<Crop>> findByPlantType(
            @RequestParam String plantType) {

        return ResponseEntity.ok(
                cropService.findByPlantType(plantType)
        );
    }

    // =========================
    // CREATE
    // POST /api/crops
    // =========================
    @PostMapping
    public ResponseEntity<Crop> createCrop(
            @RequestBody Crop crop) {

        return ResponseEntity.ok(
                cropService.createCrop(crop)
        );
    }

    // =========================
    // UPDATE
    // PUT /api/crops/{id}
    // =========================
    @PutMapping("/{id}")
    public ResponseEntity<Crop> updateCrop(
            @PathVariable Long id,
            @RequestBody Crop crop) {

        return ResponseEntity.ok(
                cropService.updateCrop(id, crop)
        );
    }

    // =========================
    // DELETE
    // DELETE /api/crops/{id}
    // =========================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCrop(
            @PathVariable Long id) {

        cropService.deleteCrop(id);

        return ResponseEntity.noContent().build();
    }
}
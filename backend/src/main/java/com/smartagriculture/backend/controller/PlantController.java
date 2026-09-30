package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.dto.PlantRequest;
import com.smartagriculture.backend.dto.PlantResponse;
import com.smartagriculture.backend.service.PlantService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plants")
public class PlantController {

    private final PlantService plantService;

    public PlantController(PlantService plantService) {
        this.plantService = plantService;
    }

    // =========================
    // GET ALL
    // =========================
    @GetMapping
    public ResponseEntity<List<PlantResponse>> getAll() {

        return ResponseEntity.ok(
                plantService.getAll()
        );
    }

    // =========================
    // GET BY USER
    // =========================
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PlantResponse>> getByUser(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                plantService.getByUser(userId)
        );
    }

    // =========================
    // GET DETAIL
    // =========================
    @GetMapping("/{id}")
    public ResponseEntity<PlantResponse> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                plantService.getById(id)
        );
    }

    // =========================
    // CREATE
    // =========================
    @PostMapping
    public ResponseEntity<PlantResponse> create(
            @RequestBody PlantRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(plantService.create(request));
    }

    // =========================
    // UPDATE
    // =========================
    @PutMapping("/{id}")
    public ResponseEntity<PlantResponse> update(
            @PathVariable Long id,
            @RequestBody PlantRequest request) {

        return ResponseEntity.ok(
                plantService.update(id, request)
        );
    }

    // =========================
    // DELETE
    // =========================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        plantService.delete(id);

        return ResponseEntity.noContent().build();
    }
}
package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.dto.PlantRequest;
import com.smartagriculture.backend.dto.PlantResponse;
import com.smartagriculture.backend.service.PlantService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plants")
public class PlantController {

    private final PlantService plantService;

    public PlantController(PlantService plantService) {
        this.plantService = plantService;
    }

    @GetMapping
    public List<PlantResponse> getAll(
            @RequestParam Long farmerId) {

        return plantService.getAll(farmerId);
    }

    @GetMapping("/{plantId}")
    public PlantResponse getById(
            @PathVariable Long plantId,
            @RequestParam Long farmerId) {

        return plantService.getById(plantId, farmerId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PlantResponse create(
            @RequestParam Long farmerId,
            @Valid @RequestBody PlantRequest request) {

        return plantService.create(farmerId, request);
    }

    @PutMapping("/{plantId}")
    public PlantResponse update(
            @PathVariable Long plantId,
            @RequestParam Long farmerId,
            @Valid @RequestBody PlantRequest request) {

        return plantService.update(plantId, farmerId, request);
    }

    @DeleteMapping("/{plantId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long plantId,
            @RequestParam Long farmerId) {

        plantService.delete(plantId, farmerId);
    }
}

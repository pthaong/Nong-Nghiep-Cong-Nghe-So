
package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.dto.SeasonRequest;
import com.smartagriculture.backend.dto.SeasonResponse;
import com.smartagriculture.backend.service.SeasonService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"})
@RequestMapping("/api/seasons")
public class SeasonController {

    private final SeasonService seasonService;

    public SeasonController(SeasonService seasonService) {
        this.seasonService = seasonService;
    }

    // Danh sÃ¡ch mÃ¹a vá»¥ theo nÃ´ng dÃ¢n
    @GetMapping
    public List<SeasonResponse> getAll(
            @RequestParam Long farmerId) {

        return seasonService.getByFarmer(farmerId);
    }

    // Xem chi tiáº¿t mÃ¹a vá»¥
    @GetMapping("/{id}")
    public SeasonResponse getById(
            @PathVariable Long id,
            @RequestParam Long farmerId) {

        return seasonService.getById(id, farmerId);
    }

    // ThÃªm mÃ¹a vá»¥
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SeasonResponse create(
            @RequestParam Long farmerId,
            @Valid @RequestBody SeasonRequest request) {

        return seasonService.create(farmerId, request);
    }

    // Sá»­a mÃ¹a vá»¥
    @PutMapping("/{id}")
    public SeasonResponse update(
            @PathVariable Long id,
            @RequestParam Long farmerId,
            @Valid @RequestBody SeasonRequest request) {

        return seasonService.update(id, farmerId, request);
    }

    // XÃ³a mÃ¹a vá»¥
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long id,
            @RequestParam Long farmerId) {

        seasonService.delete(id, farmerId);
    }
}


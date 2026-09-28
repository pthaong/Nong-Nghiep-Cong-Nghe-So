
package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.dto.SeasonRequest;
import com.smartagriculture.backend.dto.SeasonResponse;
import com.smartagriculture.backend.service.SeasonService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seasons")
public class SeasonController {

    private final SeasonService seasonService;

    public SeasonController(SeasonService seasonService) {
        this.seasonService = seasonService;
    }

    // Danh sách mùa vụ theo nông dân
    @GetMapping
    public List<SeasonResponse> getAll(
            @RequestParam Long farmerId) {

        return seasonService.getByFarmer(farmerId);
    }

    // Xem chi tiết mùa vụ
    @GetMapping("/{id}")
    public SeasonResponse getById(
            @PathVariable Long id,
            @RequestParam Long farmerId) {

        return seasonService.getById(id, farmerId);
    }

    // Thêm mùa vụ
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SeasonResponse create(
            @RequestParam Long farmerId,
            @Valid @RequestBody SeasonRequest request) {

        return seasonService.create(farmerId, request);
    }

    // Sửa mùa vụ
    @PutMapping("/{id}")
    public SeasonResponse update(
            @PathVariable Long id,
            @RequestParam Long farmerId,
            @Valid @RequestBody SeasonRequest request) {

        return seasonService.update(id, farmerId, request);
    }

    // Xóa mùa vụ
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long id,
            @RequestParam Long farmerId) {

        seasonService.delete(id, farmerId);
    }
}

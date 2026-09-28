package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.entity.Season;
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

    // Lấy danh sách mùa vụ theo nông dân
    @GetMapping
    public List<Season> getAll(@RequestParam Long farmerId) {
        return seasonService.getByFarmer(farmerId);
    }

    // Xem chi tiết mùa vụ
    @GetMapping("/{id}")
    public Season getById(@PathVariable Long id) {
        return seasonService.getById(id);
    }

    // Thêm mùa vụ
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Season create(
            @RequestParam Long farmerId,
            @Valid @RequestBody Season season) {

        return seasonService.create(farmerId, season);
    }

    // Cập nhật mùa vụ
    @PutMapping("/{id}")
    public Season update(
            @PathVariable Long id,
            @Valid @RequestBody Season season) {

        return seasonService.update(id, season);
    }

    // Xóa mùa vụ
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
    seasonService.delete(id);
    }
}

package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.dto.FarmingDiaryRequest;
import com.smartagriculture.backend.dto.FarmingDiaryResponse;
import com.smartagriculture.backend.service.FarmingDiaryService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seasons/{seasonId}/diaries")
public class FarmingDiaryController {

    private final FarmingDiaryService diaryService;

    public FarmingDiaryController(FarmingDiaryService diaryService) {
        this.diaryService = diaryService;
    }

    // Danh sách nhật ký của một mùa vụ
    @GetMapping
    public List<FarmingDiaryResponse> getAll(
            @PathVariable Long seasonId,
            @RequestParam Long farmerId) {

        return diaryService.getBySeason(seasonId, farmerId);
    }

    // Xem chi tiết một nhật ký
    @GetMapping("/{diaryId}")
    public FarmingDiaryResponse getById(
            @PathVariable Long seasonId,
            @PathVariable Long diaryId,
            @RequestParam Long farmerId) {

        return diaryService.getById(
                seasonId, diaryId, farmerId);
    }

    // Thêm nhật ký
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FarmingDiaryResponse create(
            @PathVariable Long seasonId,
            @RequestParam Long farmerId,
            @Valid @RequestBody FarmingDiaryRequest request) {

        return diaryService.create(
                seasonId, farmerId, request);
    }

    // Cập nhật nhật ký
    @PutMapping("/{diaryId}")
    public FarmingDiaryResponse update(
            @PathVariable Long seasonId,
            @PathVariable Long diaryId,
            @RequestParam Long farmerId,
            @Valid @RequestBody FarmingDiaryRequest request) {

        return diaryService.update(
                seasonId, diaryId, farmerId, request);
    }

    // Xóa nhật ký
    @DeleteMapping("/{diaryId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long seasonId,
            @PathVariable Long diaryId,
            @RequestParam Long farmerId) {

        diaryService.delete(
                seasonId, diaryId, farmerId);
    }
}

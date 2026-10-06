package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.dto.AdminDiaryResponse;
import com.smartagriculture.backend.service.AdminDiaryService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
@RequestMapping("/api/admin/diaries")
public class AdminDiaryController {

    private final AdminDiaryService adminDiaryService;

    public AdminDiaryController(
            AdminDiaryService adminDiaryService) {

        this.adminDiaryService = adminDiaryService;
    }

    @GetMapping
    public List<AdminDiaryResponse> getAll() {
        return adminDiaryService.getAll();
    }

    @GetMapping("/{id}")
    public AdminDiaryResponse getById(
            @PathVariable Long id) {

        return adminDiaryService.getById(id);
    }
}
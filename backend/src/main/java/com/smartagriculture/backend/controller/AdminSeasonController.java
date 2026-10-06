package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.dto.AdminSeasonResponse;
import com.smartagriculture.backend.service.AdminSeasonService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/seasons")
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
public class AdminSeasonController {

    private final AdminSeasonService adminSeasonService;

    public AdminSeasonController(AdminSeasonService adminSeasonService) {
        this.adminSeasonService = adminSeasonService;
    }

    // Admin xem tất cả mùa vụ
    @GetMapping
    public List<AdminSeasonResponse> getAll() {
        return adminSeasonService.getAll();
    }

    // Admin xem/tìm mùa vụ theo ID
    @GetMapping("/{id}")
    public AdminSeasonResponse getById(@PathVariable Long id) {
        return adminSeasonService.getById(id);
    }
}
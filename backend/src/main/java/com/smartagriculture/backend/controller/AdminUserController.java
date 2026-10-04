package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.dto.AdminUserResponse;
import com.smartagriculture.backend.service.AdminUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.smartagriculture.backend.dto.PlantResponse;
import com.smartagriculture.backend.service.PlantService;
import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = {
        "http://localhost:5500",
        "http://127.0.0.1:5500"
})
public class AdminUserController {

    private final AdminUserService adminUserService;
private final PlantService plantService;

public AdminUserController(
        AdminUserService adminUserService,
        PlantService plantService
) {
    this.adminUserService = adminUserService;
    this.plantService = plantService;
}

    // ==============================
    // DANH SÁCH FARMER
    // GET /api/admin/users/farmers
    // ==============================
    @GetMapping("/farmers")
    public ResponseEntity<List<AdminUserResponse>> getAllFarmers() {

        return ResponseEntity.ok(
                adminUserService.getAllFarmers()
        );
    }

    // ==============================
    // TÌM KIẾM FARMER
    // GET /api/admin/users/farmers/search?keyword=nguyen
    // ==============================
    @GetMapping("/farmers/search")
    public ResponseEntity<List<AdminUserResponse>> searchFarmers(
            @RequestParam String keyword
    ) {

        return ResponseEntity.ok(
                adminUserService.searchFarmers(keyword)
        );
    }
    // ==============================
// XEM DANH SÁCH CÂY CỦA FARMER
// GET /api/admin/users/{farmerId}/plants
// ==============================
@GetMapping("/{farmerId}/plants")
public ResponseEntity<List<PlantResponse>> getFarmerPlants(
        @PathVariable Long farmerId
) {
    return ResponseEntity.ok(
            plantService.getAllForAdmin(farmerId)
    );
}

    // ==============================
    // KHÓA FARMER
    // PUT /api/admin/users/{id}/lock
    // ==============================
    @PutMapping("/{id}/lock")
    public ResponseEntity<AdminUserResponse> lockFarmer(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                adminUserService.lockFarmer(id)
        );
    }

    // ==============================
    // MỞ KHÓA FARMER
    // PUT /api/admin/users/{id}/unlock
    // ==============================
    @PutMapping("/{id}/unlock")
    public ResponseEntity<AdminUserResponse> unlockFarmer(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                adminUserService.unlockFarmer(id)
        );
    }

    // ==============================
    // XÓA FARMER
    // DELETE /api/admin/users/{id}
    // ==============================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFarmer(
            @PathVariable Long id
    ) {

        adminUserService.deleteFarmer(id);

        return ResponseEntity.noContent().build();
    }
}
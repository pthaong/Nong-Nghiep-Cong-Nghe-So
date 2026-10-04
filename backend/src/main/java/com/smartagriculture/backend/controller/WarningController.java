package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.entity.Warning;
import com.smartagriculture.backend.service.WarningService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@CrossOrigin(origins = {
"http://127.0.0.1:5500",
"http://localhost:5500"
})
@RequestMapping("/api/warnings")
public class WarningController {

private final WarningService warningService;

public WarningController(WarningService warningService) {
    this.warningService = warningService;
}

// =========================
// GET ALL / FILTER
// GET /api/warnings
// GET /api/warnings?area=Hải Phòng
// GET /api/warnings?level=HIGH
// =========================
@GetMapping
public ResponseEntity<List<Warning>> getAll(
        @RequestParam(required = false) String area,
        @RequestParam(required = false) String level) {

    return ResponseEntity.ok(
            warningService.getAll(area, level)
    );
}

// =========================
// GET BY ID
// GET /api/warnings/{id}
// =========================
@GetMapping("/{id}")
public ResponseEntity<Warning> getById(
        @PathVariable Long id) {

    return ResponseEntity.ok(
            warningService.getById(id)
    );
}

// =========================
// CREATE
// POST /api/warnings
// =========================
@PostMapping
public ResponseEntity<Warning> create(
        @Valid @RequestBody Warning warning) {

    return ResponseEntity.ok(
            warningService.create(warning)
    );
}

// =========================
// UPDATE
// PUT /api/warnings/{id}
// =========================
@PutMapping("/{id}")
public ResponseEntity<Warning> update(
        @PathVariable Long id,
        @Valid @RequestBody Warning warning) {

    return ResponseEntity.ok(
            warningService.update(id, warning)
    );
}
// =========================
// DELETE
// DELETE /api/warnings/{id}
// =========================
@DeleteMapping("/{id}")
public ResponseEntity<Void> delete(
        @PathVariable Long id) {

    warningService.delete(id);

    return ResponseEntity.noContent().build();
}

}
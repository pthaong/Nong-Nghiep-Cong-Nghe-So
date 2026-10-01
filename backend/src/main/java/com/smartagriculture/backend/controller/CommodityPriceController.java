package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.dto.CommodityPriceRequest;
import com.smartagriculture.backend.dto.CommodityPriceResponse;
import com.smartagriculture.backend.service.CommodityPriceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prices")
public class CommodityPriceController {

    private final CommodityPriceService service;

    public CommodityPriceController(
            CommodityPriceService service
    ) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<CommodityPriceResponse>> getAll(
            @RequestParam(required = false)
            String commodityType
    ) {

        return ResponseEntity.ok(
                service.getAll(commodityType)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommodityPriceResponse> getById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                service.getById(id)
        );
    }

    @PostMapping
    public ResponseEntity<CommodityPriceResponse> create(
            @Valid @RequestBody
            CommodityPriceRequest request
    ) {

        return ResponseEntity.ok(
                service.create(request)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommodityPriceResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody
            CommodityPriceRequest request
    ) {

        return ResponseEntity.ok(
                service.update(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {

        service.delete(id);

        return ResponseEntity.noContent().build();
    }
}
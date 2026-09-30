package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.dto.AiCareRequest;
import com.smartagriculture.backend.dto.AiCareResponse;
import com.smartagriculture.backend.service.AiCareService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai-care")
public class AiCareController {

    private final AiCareService aiCareService;

    public AiCareController(AiCareService aiCareService) {
        this.aiCareService = aiCareService;
    }

    @PostMapping
    public ResponseEntity<AiCareResponse> getAdvice(
            @RequestBody AiCareRequest request) {

        return ResponseEntity.ok(
                aiCareService.getAdvice(request)
        );
    }
}
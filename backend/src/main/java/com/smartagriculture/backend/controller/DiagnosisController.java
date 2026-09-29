package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.dto.DiagnosisRequest;
import com.smartagriculture.backend.dto.DiagnosisResponse;
import com.smartagriculture.backend.service.DiagnosisService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/diagnosis")
public class DiagnosisController {

private final DiagnosisService diagnosisService;

public DiagnosisController(
        DiagnosisService diagnosisService) {

    this.diagnosisService = diagnosisService;
}

// =========================================================
// CHẨN ĐOÁN BẰNG TRIỆU CHỨNG
// =========================================================

@PostMapping("/text")
public DiagnosisResponse diagnose(
        @RequestParam(required = false)
        Long userId,

        @RequestBody
        DiagnosisRequest request) {

    if (request == null) {

        throw new IllegalArgumentException(
                "Dữ liệu chẩn đoán không được để trống."
        );
    }

    return diagnosisService.diagnose(
            userId,
            request.getPlantType(),
            request.getSymptoms()
    );
}

// =========================================================
// CHẨN ĐOÁN BẰNG ẢNH
// =========================================================

@PostMapping(
        value = "/image",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
)
public DiagnosisResponse diagnoseByImage(

        @RequestParam(required = false)
        Long userId,

        @RequestParam("plantType")
        String plantType,

        @RequestParam(
                value = "symptoms",
                required = false
        )
        String symptoms,

        @RequestParam("image")
        MultipartFile image)

        throws Exception {

    return diagnosisService.diagnoseByImage(
            userId,
            plantType,
            symptoms,
            image
    );
}

}
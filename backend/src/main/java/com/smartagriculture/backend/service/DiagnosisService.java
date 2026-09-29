package com.smartagriculture.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartagriculture.backend.dto.DiagnosisRequest;
import com.smartagriculture.backend.dto.DiagnosisResponse;
import com.smartagriculture.backend.entity.DiagnosisHistory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DiagnosisService {

private final GeminiService geminiService;
private final DiagnosisHistoryService historyService;
private final ObjectMapper objectMapper;

public DiagnosisService(
        GeminiService geminiService,
        DiagnosisHistoryService historyService) {

    this.geminiService = geminiService;
    this.historyService = historyService;
    this.objectMapper = new ObjectMapper();
}

// =========================================================
// CHẨN ĐOÁN BẰNG TEXT
// =========================================================

public DiagnosisResponse diagnose(
        Long userId,
        String plantType,
        String symptoms) {

    if (plantType == null ||
            plantType.isBlank()) {

        throw new IllegalArgumentException(
                "Loại cây không được để trống."
        );
    }

    if (symptoms == null ||
            symptoms.isBlank()) {

        throw new IllegalArgumentException(
                "Triệu chứng không được để trống."
        );
    }

    String prompt = """
            Bạn là AI chuyên hỗ trợ chẩn đoán bệnh cây trồng.

            Loại cây:
            %s

            Triệu chứng:
            %s

            Hãy tự phân tích dựa trên thông tin được cung cấp.

            Trả về DUY NHẤT JSON:

            {
              "diseaseName": "Tên bệnh",
              "severity": "Mức độ",
              "symptoms": "Dấu hiệu",
              "cause": "Nguyên nhân",
              "treatment": "Cách xử lý",
              "prevention": "Cách phòng ngừa"
            }

            Nếu không đủ thông tin:
            diseaseName = "Chưa thể xác định"

            Không sử dụng Markdown.
            Không thêm ```json.
            """.formatted(
            plantType,
            symptoms
    );

    String aiResult =
            geminiService.ask(prompt);

    return buildResponseAndSave(
            userId,
            plantType,
            symptoms,
            null,
            aiResult
    );
}

// =========================================================
// GIỮ API CŨ
// =========================================================

public DiagnosisResponse diagnose(
        String plantType,
        String symptoms) {

    return diagnose(
            null,
            plantType,
            symptoms
    );
}

// =========================================================
// DIAGNOSIS REQUEST
// =========================================================

public DiagnosisResponse diagnose(
        DiagnosisRequest request) {

    if (request == null) {

        throw new IllegalArgumentException(
                "Dữ liệu chẩn đoán không được để trống."
        );
    }

    return diagnose(
            null,
            request.getPlantType(),
            request.getSymptoms()
    );
}

// =========================================================
// CHẨN ĐOÁN BẰNG ẢNH
// =========================================================

public DiagnosisResponse diagnoseByImage(
        Long userId,
        String plantType,
        String symptoms,
        MultipartFile image)
        throws Exception {

    if (plantType == null ||
            plantType.isBlank()) {

        plantType = "Không xác định";
    }

    if (symptoms == null ||
            symptoms.isBlank()) {

        symptoms =
                "Người dùng không cung cấp triệu chứng.";
    }

    if (image == null ||
            image.isEmpty()) {

        throw new IllegalArgumentException(
                "Vui lòng tải lên ảnh cây cần chẩn đoán."
        );
    }

    String aiResult =
            geminiService.analyzeImage(
                    plantType,
                    symptoms,
                    image
            );

    return buildResponseAndSave(
            userId,
            plantType,
            symptoms,
            image.getOriginalFilename(),
            aiResult
    );
}

// =========================================================
// GIỮ API CŨ
// =========================================================

public DiagnosisResponse diagnoseByImage(
        String plantType,
        String symptoms,
        MultipartFile image)
        throws Exception {

    return diagnoseByImage(
            null,
            plantType,
            symptoms,
            image
    );
}

// =========================================================
// PARSE AI + LƯU DATABASE
// =========================================================

private DiagnosisResponse buildResponseAndSave(
        Long userId,
        String plantType,
        String symptoms,
        String imageName,
        String aiResult) {

    try {

        JsonNode root =
                objectMapper.readTree(aiResult);

        String diseaseName =
                getText(
                        root,
                        "diseaseName"
                );

        String severity =
                getText(
                        root,
                        "severity"
                );

        String aiSymptoms =
                getText(
                        root,
                        "symptoms"
                );

        String cause =
                getText(
                        root,
                        "cause"
                );

        String treatment =
                getText(
                        root,
                        "treatment"
                );

        String prevention =
                getText(
                        root,
                        "prevention"
                );

        // ==========================================
        // LƯU LỊCH SỬ
        // ==========================================

        DiagnosisHistory history =
                new DiagnosisHistory();

        history.setUserId(userId);
        history.setPlantType(plantType);
        history.setSymptoms(
                symptoms
        );
        history.setImageName(
                imageName
        );
        history.setDiseaseName(
                diseaseName
        );
        history.setSeverity(
                severity
        );
        history.setCause(
                cause
        );
        history.setTreatment(
                treatment
        );
        history.setPrevention(
                prevention
        );
        history.setResult(
                aiResult
        );

        historyService.save(history);

        // ==========================================
        // RESPONSE
        // ==========================================

        DiagnosisResponse response =
                new DiagnosisResponse();

        response.setSuccess(true);

        response.setDiseaseName(
                diseaseName
        );

        response.setSeverity(
                severity
        );

        response.setSymptoms(
                aiSymptoms
        );

        response.setCause(
                cause
        );

        response.setTreatment(
                treatment
        );

        response.setPrevention(
                prevention
        );

        response.setDiagnosis(
                aiResult
        );

        return response;

    } catch (Exception e) {

        throw new RuntimeException(
                "Không thể xử lý kết quả chẩn đoán AI: "
                        + e.getMessage(),
                e
        );
    }
}

// =========================================================
// ĐỌC FIELD JSON
// =========================================================

private String getText(
        JsonNode root,
        String field) {

    JsonNode node =
            root.path(field);

    if (node.isMissingNode() ||
            node.isNull()) {

        return "";
    }

    return node.asText();
}

}
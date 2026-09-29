package com.smartagriculture.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

@Value("${gemini.api.key}")
private String apiKey;

@Value("${gemini.model:gemini-3.8-flash}")
private String model;

private final RestTemplate restTemplate;
private final ObjectMapper objectMapper;

public GeminiService() {
    this.restTemplate = new RestTemplate();
    this.objectMapper = new ObjectMapper();
}

// =========================================================
// CHẨN ĐOÁN BẰNG TEXT
// =========================================================

public String ask(String prompt) {

    String url =
            "https://generativelanguage.googleapis.com/v1beta/models/"
                    + model
                    + ":generateContent";

    Map<String, Object> textPart = new HashMap<>();
    textPart.put("text", prompt);

    Map<String, Object> content = new HashMap<>();
    content.put("parts", List.of(textPart));

    Map<String, Object> requestBody = new HashMap<>();
    requestBody.put("contents", List.of(content));

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("x-goog-api-key", apiKey);

    HttpEntity<Map<String, Object>> request =
            new HttpEntity<>(requestBody, headers);

    for (int attempt = 1; attempt <= 3; attempt++) {

        try {

            ResponseEntity<String> response =
                    restTemplate.exchange(
                            url,
                            HttpMethod.POST,
                            request,
                            String.class
                    );

            return extractText(response.getBody());

        } catch (HttpServerErrorException.ServiceUnavailable e) {

            if (attempt == 3) {
                throw new RuntimeException(
                        "Gemini hiện đang quá tải. Vui lòng thử lại sau."
                );
            }

            waitBeforeRetry(attempt);

        } catch (HttpClientErrorException.TooManyRequests e) {

            if (attempt == 3) {
                throw new RuntimeException(
                        "Gemini API đã vượt giới hạn request. Vui lòng thử lại sau."
                );
            }

            waitBeforeRetry(attempt);

        } catch (Exception e) {

            throw new RuntimeException(
                    "Gemini API error: " + e.getMessage(),
                    e
            );
        }
    }

    throw new RuntimeException(
            "Không thể kết nối Gemini."
    );
}

// =========================================================
// CHẨN ĐOÁN BẰNG ẢNH
// =========================================================

public String analyzeImage(
        String plantType,
        String symptoms,
        MultipartFile image) throws IOException {

    if (image == null || image.isEmpty()) {
        throw new IllegalArgumentException(
                "Vui lòng tải lên ảnh cây cần chẩn đoán."
        );
    }

    String mimeType = image.getContentType();

    if (mimeType == null ||
            !mimeType.startsWith("image/")) {

        throw new IllegalArgumentException(
                "File tải lên phải là hình ảnh."
        );
    }

    String base64Image =
            Base64.getEncoder()
                    .encodeToString(image.getBytes());

    String prompt = """
            Bạn là AI chuyên hỗ trợ chẩn đoán bệnh cây trồng.

            Hãy TỰ PHÂN TÍCH hình ảnh cây/lá được cung cấp.
            Không được chọn một bệnh cố định nếu hình ảnh
            không có đủ bằng chứng.

            Thông tin người dùng cung cấp:

            Loại cây:
            %s

            Triệu chứng người dùng mô tả:
            %s

            Hãy kết hợp:
            - Hình ảnh thực tế
            - Loại cây
            - Triệu chứng người dùng cung cấp

            để đưa ra chẩn đoán phù hợp nhất.

            Hãy trả về DUY NHẤT JSON hợp lệ theo cấu trúc:

            {
              "diseaseName": "Tên bệnh",
              "severity": "Mức độ nghiêm trọng",
              "symptoms": "Các dấu hiệu quan sát được",
              "cause": "Nguyên nhân có thể gây bệnh",
              "treatment": "Cách xử lý",
              "prevention": "Cách phòng ngừa"
            }

            QUY TẮC:

            1. diseaseName phải dựa trên hình ảnh và thông tin được cung cấp.
            2. Không được mặc định bệnh đốm lá.
            3. Nếu không đủ thông tin để xác định bệnh,
               diseaseName phải là "Chưa thể xác định".
            4. Nếu không chắc chắn, phải nói rõ trong phần symptoms
               hoặc cause rằng kết quả chỉ mang tính tham khảo.
            5. severity có thể là:
               "Nhẹ", "Trung bình", "Nặng"
               hoặc "Chưa xác định".
            6. Không thêm Markdown.
            7. Không thêm ```json.
            8. Chỉ trả về JSON.

            """.formatted(
            plantType == null || plantType.isBlank()
                    ? "Không xác định"
                    : plantType,

            symptoms == null || symptoms.isBlank()
                    ? "Không cung cấp"
                    : symptoms
    );

    Map<String, Object> textPart =
            new HashMap<>();

    textPart.put("text", prompt);

    Map<String, Object> inlineData =
            new HashMap<>();

    inlineData.put(
            "mimeType",
            mimeType
    );

    inlineData.put(
            "data",
            base64Image
    );

    Map<String, Object> imagePart =
            new HashMap<>();

    imagePart.put(
            "inlineData",
            inlineData
    );

    Map<String, Object> content =
            new HashMap<>();

    content.put(
            "parts",
            List.of(
                    textPart,
                    imagePart
            )
    );

    Map<String, Object> requestBody =
            new HashMap<>();

    requestBody.put(
            "contents",
            List.of(content)
    );

    HttpHeaders headers =
            new HttpHeaders();

    headers.setContentType(
            MediaType.APPLICATION_JSON
    );

    headers.set(
            "x-goog-api-key",
            apiKey
    );

    HttpEntity<Map<String, Object>> request =
            new HttpEntity<>(
                    requestBody,
                    headers
            );

    String url =
            "https://generativelanguage.googleapis.com/v1beta/models/"
                    + model
                    + ":generateContent";

    for (int attempt = 1; attempt <= 3; attempt++) {

        try {

            ResponseEntity<String> response =
                    restTemplate.exchange(
                            url,
                            HttpMethod.POST,
                            request,
                            String.class
                    );

            String aiResponse =
                    extractText(response.getBody());

            // Kiểm tra JSON AI trả về
            validateDiagnosisJson(aiResponse);

            return aiResponse;

        } catch (HttpServerErrorException.ServiceUnavailable e) {

            if (attempt == 3) {
                throw new RuntimeException(
                        "Gemini hiện đang quá tải. Vui lòng thử lại sau."
                );
            }

            waitBeforeRetry(attempt);

        } catch (HttpClientErrorException.TooManyRequests e) {

            if (attempt == 3) {
                throw new RuntimeException(
                        "Gemini API đã vượt giới hạn request. Vui lòng thử lại sau."
                );
            }

            waitBeforeRetry(attempt);

        } catch (RuntimeException e) {

            throw e;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Không thể gọi Gemini API: "
                            + e.getMessage(),
                    e
            );
        }
    }

    throw new RuntimeException(
            "Không thể kết nối Gemini."
    );
}

// =========================================================
// ĐỌC RESPONSE GEMINI
// =========================================================

private String extractText(
        String responseBody) {

    try {

        if (responseBody == null ||
                responseBody.isBlank()) {

            throw new RuntimeException(
                    "Gemini trả về response rỗng."
            );
        }

        JsonNode root =
                objectMapper.readTree(
                        responseBody
                );

        JsonNode textNode =
                root.path("candidates")
                        .path(0)
                        .path("content")
                        .path("parts")
                        .path(0)
                        .path("text");

        if (textNode.isMissingNode() ||
                textNode.isNull()) {

            throw new RuntimeException(
                    "Gemini không trả về nội dung chẩn đoán."
            );
        }

        return cleanJsonResponse(
                textNode.asText()
        );

    } catch (Exception e) {

        throw new RuntimeException(
                "Không thể đọc response Gemini: "
                        + e.getMessage(),
                e
        );
    }
}

// =========================================================
// LÀM SẠCH JSON
// =========================================================

private String cleanJsonResponse(
        String response) {

    if (response == null) {
        return "";
    }

    response = response.trim();

    if (response.startsWith("```json")) {
        response = response.substring(7);
    }

    if (response.startsWith("```")) {
        response = response.substring(3);
    }

    if (response.endsWith("```")) {
        response =
                response.substring(
                        0,
                        response.length() - 3
                );
    }

    return response.trim();
}

// =========================================================
// KIỂM TRA JSON CHẨN ĐOÁN
// =========================================================

private void validateDiagnosisJson(
        String json) {

    try {

        JsonNode root =
                objectMapper.readTree(json);

        if (!root.has("diseaseName")) {
            throw new RuntimeException(
                    "Gemini response thiếu diseaseName."
            );
        }

        if (!root.has("severity")) {
            throw new RuntimeException(
                    "Gemini response thiếu severity."
            );
        }

        if (!root.has("symptoms")) {
            throw new RuntimeException(
                    "Gemini response thiếu symptoms."
            );
        }

        if (!root.has("cause")) {
            throw new RuntimeException(
                    "Gemini response thiếu cause."
            );
        }

        if (!root.has("treatment")) {
            throw new RuntimeException(
                    "Gemini response thiếu treatment."
            );
        }

        if (!root.has("prevention")) {
            throw new RuntimeException(
                    "Gemini response thiếu prevention."
            );
        }

    } catch (IOException e) {

        throw new RuntimeException(
                "Gemini trả về JSON không hợp lệ.",
                e
        );
    }
}

// =========================================================
// RETRY
// =========================================================

private void waitBeforeRetry(
        int attempt) {

    try {

        Thread.sleep(
                2000L * attempt
        );

    } catch (InterruptedException e) {

        Thread.currentThread().interrupt();

        throw new RuntimeException(
                "Request Gemini bị gián đoạn."
        );
    }
}

}
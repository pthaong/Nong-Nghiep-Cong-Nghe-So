package com.smartagriculture.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartagriculture.backend.dto.AiCareRequest;
import com.smartagriculture.backend.dto.AiCareResponse;
import org.springframework.stereotype.Service;

@Service
public class AiCareService {

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public AiCareService(GeminiService geminiService) {
        this.geminiService = geminiService;
        this.objectMapper = new ObjectMapper();
    }

    public AiCareResponse getAdvice(AiCareRequest request) {

        validateRequest(request);

        String information =
                request.getInformation() == null
                        || request.getInformation().isBlank()
                        ? "Không có thông tin bổ sung."
                        : request.getInformation();

        String prompt = """
                Bạn là AI chuyên gia tư vấn chăm sóc cây trồng.

                Hãy phân tích thông tin cây trồng dưới đây:

                Loại cây:
                %s

                Giai đoạn sinh trưởng:
                %s

                Vấn đề hiện tại:
                %s

                Thông tin liên quan:
                %s

                Hãy đưa ra khuyến nghị chăm sóc phù hợp.

                BẮT BUỘC trả về JSON hợp lệ.
                Không dùng Markdown.
                Không dùng ```json.
                Không thêm nội dung bên ngoài JSON.

                Cấu trúc JSON bắt buộc:

                {
                  "watering": "Khuyến nghị tưới nước",
                  "fertilizer": "Khuyến nghị phân bón",
                  "care": "Khuyến nghị chăm sóc",
                  "diseasePrevention": "Khuyến nghị phòng bệnh"
                }

                Nội dung cần có:

                watering:
                - Tần suất tưới.
                - Thời điểm tưới.
                - Lưu ý lượng nước.
                - Điều chỉnh theo thời tiết nếu cần.

                fertilizer:
                - Nhu cầu dinh dưỡng.
                - Loại phân bón phù hợp.
                - Thời điểm bón.
                - Lưu ý khi sử dụng.

                care:
                - Ánh sáng.
                - Đất.
                - Vệ sinh cây.
                - Tỉa lá/cành nếu cần.
                - Các lưu ý trong giai đoạn hiện tại.

                diseasePrevention:
                - Bệnh có thể thường gặp.
                - Dấu hiệu cần theo dõi.
                - Biện pháp phòng ngừa.

                Không được khẳng định chắc chắn nếu thông tin chưa đủ.
                Các khuyến nghị chỉ mang tính tham khảo.
                """.formatted(
                request.getPlantType(),
                request.getGrowthStage(),
                request.getProblem(),
                information
        );

        String aiResult = geminiService.ask(prompt);

        return parseAiResponse(
                request,
                aiResult
        );
    }

    private void validateRequest(AiCareRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Request không được để trống."
            );
        }

        if (request.getPlantType() == null
                || request.getPlantType().isBlank()) {

            throw new IllegalArgumentException(
                    "Loại cây không được để trống."
            );
        }

        if (request.getGrowthStage() == null
                || request.getGrowthStage().isBlank()) {

            throw new IllegalArgumentException(
                    "Giai đoạn cây không được để trống."
            );
        }

        if (request.getProblem() == null
                || request.getProblem().isBlank()) {

            throw new IllegalArgumentException(
                    "Vấn đề của cây không được để trống."
            );
        }
    }

    private AiCareResponse parseAiResponse(
            AiCareRequest request,
            String aiResult) {

        try {

            String json = cleanJson(aiResult);

            JsonNode root =
                    objectMapper.readTree(json);

            AiCareResponse response =
                    new AiCareResponse();

            response.setSuccess(true);

            response.setPlantType(
                    request.getPlantType()
            );

            response.setGrowthStage(
                    request.getGrowthStage()
            );

            response.setWatering(
                    root.path("watering")
                            .asText(
                                    "AI chưa đưa ra khuyến nghị tưới."
                            )
            );

            response.setFertilizer(
                    root.path("fertilizer")
                            .asText(
                                    "AI chưa đưa ra khuyến nghị phân bón."
                            )
            );

            response.setCare(
                    root.path("care")
                            .asText(
                                    "AI chưa đưa ra khuyến nghị chăm sóc."
                            )
            );

            response.setDiseasePrevention(
                    root.path("diseasePrevention")
                            .asText(
                                    "AI chưa đưa ra khuyến nghị phòng bệnh."
                            )
            );

            return response;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Không thể xử lý kết quả AI Care: "
                            + e.getMessage(),
                    e
            );
        }
    }

    private String cleanJson(String text) {

        if (text == null || text.isBlank()) {

            throw new RuntimeException(
                    "AI không trả về kết quả."
            );
        }

        text = text.trim();

        if (text.startsWith("```json")) {
            text = text.substring(7);
        }

        if (text.startsWith("```")) {
            text = text.substring(3);
        }

        if (text.endsWith("```")) {
            text = text.substring(
                    0,
                    text.length() - 3
            );
        }

        return text.trim();
    }
}
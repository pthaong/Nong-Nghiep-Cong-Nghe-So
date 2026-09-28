package com.smartagriculture.backend.service;

import com.smartagriculture.backend.dto.DiagnosisRequest;
import com.smartagriculture.backend.dto.DiagnosisResponse;
import com.smartagriculture.backend.entity.Disease;
import com.smartagriculture.backend.entity.Symptom;
import com.smartagriculture.backend.repository.DiseaseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DiagnosisService {

    private final DiseaseRepository diseaseRepository;

    public DiagnosisService(DiseaseRepository diseaseRepository) {
        this.diseaseRepository = diseaseRepository;
    }

    public DiagnosisResponse diagnose(DiagnosisRequest request) {

        String plantType = request.getPlantType();
        String inputSymptoms = request.getSymptoms();

        List<Disease> diseases = diseaseRepository.findAll();

        Disease bestDisease = null;
        int bestScore = 0;

        for (Disease disease : diseases) {

            int score = 0;

            // Kiểm tra loại cây
            if (plantType != null
                    && disease.getPlantType() != null
                    && disease.getPlantType()
                    .toLowerCase()
                    .contains(plantType.toLowerCase())) {

                score += 2;
            }

            // Kiểm tra triệu chứng
            if (inputSymptoms != null && disease.getSymptoms() != null) {

                for (Symptom symptom : disease.getSymptoms()) {

                    if (symptom.getName() == null) {
                        continue;
                    }

                    String symptomName =
                            symptom.getName().toLowerCase();

                    String userSymptoms =
                            inputSymptoms.toLowerCase();

                    if (userSymptoms.contains(symptomName)) {
                        score += 3;
                    }
                }
            }

            // Lưu bệnh có điểm cao nhất
            if (score > bestScore) {
                bestScore = score;
                bestDisease = disease;
            }
        }

        DiagnosisResponse response = new DiagnosisResponse();

        // Không tìm thấy bệnh
        if (bestDisease == null || bestScore == 0) {

            response.setDiseaseName("Chưa xác định");
            response.setResult("Chưa tìm thấy bệnh phù hợp");
            response.setSeverity("Chưa xác định");
            response.setCause("Chưa có dữ liệu phù hợp");
            response.setPrevention(
                    "Theo dõi cây và kiểm tra thêm triệu chứng"
            );
            response.setTreatment(
                    "Chưa có khuyến nghị xử lý cụ thể"
            );

            return response;
        }

        // Có bệnh phù hợp
        response.setDiseaseName(bestDisease.getName());
        response.setResult("Có dấu hiệu bệnh");

        // Xác định mức độ dựa vào số điểm
        if (bestScore >= 8) {
            response.setSeverity("Cao");
        } else if (bestScore >= 5) {
            response.setSeverity("Trung bình");
        } else {
            response.setSeverity("Thấp");
        }

        response.setCause(bestDisease.getCause());
        response.setPrevention(bestDisease.getPrevention());
        response.setTreatment(bestDisease.getTreatment());

        return response;
    }
}
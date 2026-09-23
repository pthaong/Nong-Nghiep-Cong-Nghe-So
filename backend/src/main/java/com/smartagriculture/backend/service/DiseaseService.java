package com.smartagriculture.backend.service;
import com.smartagriculture.backend.repository.SymptomRepository;
import com.smartagriculture.backend.entity.Symptom;
import com.smartagriculture.backend.entity.Disease;
import com.smartagriculture.backend.repository.DiseaseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DiseaseService {

  private final DiseaseRepository diseaseRepository;
private final SymptomRepository symptomRepository;

public DiseaseService(
        DiseaseRepository diseaseRepository,
        SymptomRepository symptomRepository) {

    this.diseaseRepository = diseaseRepository;
    this.symptomRepository = symptomRepository;
}

    // =========================
    // GET ALL
    // =========================
    public List<Disease> getAll() {
        return diseaseRepository.findAll();
    }

    // =========================
    // GET BY ID
    // =========================
    public Disease getById(Long id) {
        return diseaseRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Không tìm thấy bệnh")
                );
    }

    // =========================
    // CREATE
    // =========================
    public Disease create(Disease disease) {
        return diseaseRepository.save(disease);
    }

    // =========================
    // UPDATE
    // =========================
    public Disease update(Long id, Disease disease) {

        Disease existing = getById(id);

        existing.setName(disease.getName());
        existing.setPlantType(disease.getPlantType());
        existing.setDescription(disease.getDescription());
        existing.setCause(disease.getCause());
        existing.setTreatment(disease.getTreatment());
        existing.setPrevention(disease.getPrevention());

        return diseaseRepository.save(existing);
    }
public Disease addSymptom(Long diseaseId, Long symptomId) {

    Disease disease = getById(diseaseId);

    Symptom symptom =
            symptomRepository.findById(symptomId)
                    .orElseThrow(() ->
                            new RuntimeException("Không tìm thấy triệu chứng"));

    disease.getSymptoms().add(symptom);

    return diseaseRepository.save(disease);
}
public Disease removeSymptom(Long diseaseId, Long symptomId) {

    Disease disease = getById(diseaseId);

    Symptom symptom = symptomRepository.findById(symptomId)
            .orElseThrow(() ->
                    new RuntimeException("Không tìm thấy triệu chứng"));

    disease.getSymptoms().remove(symptom);

    return diseaseRepository.save(disease);
}
    // =========================
    // DELETE
    // =========================
    public void delete(Long id) {

        Disease existing = getById(id);

        diseaseRepository.delete(existing);
    }
}
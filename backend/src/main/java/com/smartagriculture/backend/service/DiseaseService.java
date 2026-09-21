package com.smartagriculture.backend.service;

import com.smartagriculture.backend.entity.Disease;
import com.smartagriculture.backend.repository.DiseaseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DiseaseService {

    private final DiseaseRepository diseaseRepository;

    public DiseaseService(DiseaseRepository diseaseRepository) {
        this.diseaseRepository = diseaseRepository;
    }

    public List<Disease> getAll() {
        return diseaseRepository.findAll();
    }

    public Disease getById(Long id) {
        return diseaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bệnh"));
    }

    public Disease create(Disease disease) {
        return diseaseRepository.save(disease);
    }

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

    public void delete(Long id) {
        diseaseRepository.deleteById(id);
    }
}
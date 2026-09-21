package com.smartagriculture.backend.service;

import com.smartagriculture.backend.entity.Symptom;
import com.smartagriculture.backend.repository.SymptomRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SymptomService {

    private final SymptomRepository symptomRepository;

    public SymptomService(SymptomRepository symptomRepository) {
        this.symptomRepository = symptomRepository;
    }

    public List<Symptom> getAll() {
        return symptomRepository.findAll();
    }

    public Symptom getById(Long id) {
        return symptomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy triệu chứng"));
    }

    public Symptom create(Symptom symptom) {
        return symptomRepository.save(symptom);
    }

    public Symptom update(Long id, Symptom symptom) {

        Symptom existing = getById(id);

        existing.setName(symptom.getName());
        existing.setDescription(symptom.getDescription());

        return symptomRepository.save(existing);
    }

    public void delete(Long id) {
        symptomRepository.deleteById(id);
    }
}
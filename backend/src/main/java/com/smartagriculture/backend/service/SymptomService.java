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

    public List<Symptom> getAllSymptoms() {
        return symptomRepository.findAll();
    }
}
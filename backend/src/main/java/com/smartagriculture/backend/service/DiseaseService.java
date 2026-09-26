package com.smartagriculture.backend.service;

import com.smartagriculture.backend.entity.Disease;
import com.smartagriculture.backend.repository.DiseaseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DiseaseService {

    private final DiseaseRepository diseaseRepository;

    public DiseaseService(DiseaseRepository diseaseRepository) {
        this.diseaseRepository = diseaseRepository;
    }

    public List<Disease> getAllDiseases() {
        return diseaseRepository.findAll();
    }

    public Optional<Disease> getDiseaseById(Long id) {
        return diseaseRepository.findById(id);
    }
}
package com.smartagriculture.backend.service;

import com.smartagriculture.backend.entity.DiagnosisHistory;
import com.smartagriculture.backend.repository.DiagnosisHistoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DiagnosisHistoryService {

    private final DiagnosisHistoryRepository repository;

    public DiagnosisHistoryService(DiagnosisHistoryRepository repository) {
        this.repository = repository;
    }

    public List<DiagnosisHistory> getAll() {
        return repository.findAll();
    }

    public DiagnosisHistory getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy lịch sử chẩn đoán"));
    }

    public DiagnosisHistory save(DiagnosisHistory history) {
        return repository.save(history);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
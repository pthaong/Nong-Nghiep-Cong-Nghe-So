package com.smartagriculture.backend.service;

import com.smartagriculture.backend.entity.DiagnosisHistory;
import com.smartagriculture.backend.repository.DiagnosisHistoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DiagnosisHistoryService {

    private final DiagnosisHistoryRepository repository;

    public DiagnosisHistoryService(
            DiagnosisHistoryRepository repository) {
        this.repository = repository;
    }

    // =========================
    // LƯU LỊCH SỬ CHẨN ĐOÁN
    // =========================
    public DiagnosisHistory save(DiagnosisHistory history) {
        return repository.save(history);
    }

    // =========================
    // LẤY TẤT CẢ LỊCH SỬ
    // =========================
    public List<DiagnosisHistory> getAll() {
        return repository.findAll();
    }

    // =========================
    // LẤY LỊCH SỬ THEO USER
    // =========================
    public List<DiagnosisHistory> getByUserId(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // =========================
    // XEM CHI TIẾT LỊCH SỬ
    // =========================
    public DiagnosisHistory getById(Long id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Không tìm thấy lịch sử chẩn đoán với id: " + id
                        )
                );
    }

    // =========================
    // XÓA LỊCH SỬ
    // =========================
    public void delete(Long id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException(
                    "Không tìm thấy lịch sử chẩn đoán với id: " + id
            );
        }

        repository.deleteById(id);
    }
}


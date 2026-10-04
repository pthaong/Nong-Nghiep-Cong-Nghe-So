package com.smartagriculture.backend.repository;

import com.smartagriculture.backend.entity.DiagnosisHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiagnosisHistoryRepository
        extends JpaRepository<DiagnosisHistory, Long> {

    // Lịch sử chẩn đoán của một Farmer, mới nhất trước
    List<DiagnosisHistory> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Admin: toàn bộ lịch sử chẩn đoán, mới nhất trước
    List<DiagnosisHistory> findAllByOrderByCreatedAtDesc();
}
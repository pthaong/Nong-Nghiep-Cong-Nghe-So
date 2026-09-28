package com.smartagriculture.backend.repository;

import com.smartagriculture.backend.entity.DiagnosisHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiagnosisHistoryRepository
        extends JpaRepository<DiagnosisHistory, Long> {
}
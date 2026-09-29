package com.smartagriculture.backend.repository;

import com.smartagriculture.backend.entity.DiagnosisHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiagnosisHistoryRepository
extends JpaRepository<DiagnosisHistory, Long> {

List<DiagnosisHistory> findByUserIdOrderByCreatedAtDesc(Long userId);

}
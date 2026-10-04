package com.smartagriculture.backend.service;

import com.smartagriculture.backend.entity.DiagnosisHistory;
import com.smartagriculture.backend.repository.DiagnosisHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class DiagnosisHistoryService {

private final DiagnosisHistoryRepository repository;

public DiagnosisHistoryService(
        DiagnosisHistoryRepository repository) {
    this.repository = repository;
}

/**
 * Lưu lịch sử chẩn đoán.
 */
public DiagnosisHistory save(DiagnosisHistory history) {

    if (history == null) {
        throw new IllegalArgumentException(
                "Dữ liệu lịch sử chẩn đoán không được để trống."
        );
    }

    return repository.save(history);
}

/**
 * Lấy toàn bộ lịch sử của một user.
 */
/**
 * Admin: lấy toàn bộ lịch sử chẩn đoán,
 * sắp xếp mới nhất trước.
 */
public List<DiagnosisHistory> getAll() {
    return repository.findAllByOrderByCreatedAtDesc();
}
public List<DiagnosisHistory> getByUserId(Long userId) {

    if (userId == null) {
        throw new IllegalArgumentException(
                "User ID không được để trống."
        );
    }

    return repository.findByUserIdOrderByCreatedAtDesc(userId);
}

/**
 * Lấy chi tiết một lần chẩn đoán.
 */
public DiagnosisHistory getById(Long id) {
    return repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy lịch sử chẩn đoán với ID: " + id
            ));
}

}
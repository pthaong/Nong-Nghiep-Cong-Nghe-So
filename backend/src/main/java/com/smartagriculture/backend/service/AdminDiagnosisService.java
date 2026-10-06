package com.smartagriculture.backend.service;

import com.smartagriculture.backend.dto.AdminDiagnosisResponse;
import com.smartagriculture.backend.entity.DiagnosisHistory;
import com.smartagriculture.backend.entity.User;
import com.smartagriculture.backend.repository.DiagnosisHistoryRepository;
import com.smartagriculture.backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AdminDiagnosisService {

    private final DiagnosisHistoryRepository diagnosisRepository;
    private final UserRepository userRepository;

    public AdminDiagnosisService(
            DiagnosisHistoryRepository diagnosisRepository,
            UserRepository userRepository) {

        this.diagnosisRepository = diagnosisRepository;
        this.userRepository = userRepository;
    }

    public List<AdminDiagnosisResponse> getAll() {

        return diagnosisRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public AdminDiagnosisResponse getById(Long id) {

        DiagnosisHistory history = diagnosisRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Không tìm thấy lịch sử chẩn đoán"
                        )
                );

        return toResponse(history);
    }

    private AdminDiagnosisResponse toResponse(
            DiagnosisHistory history) {

        User user = null;

        if (history.getUserId() != null) {
            user = userRepository
                    .findById(history.getUserId())
                    .orElse(null);
        }

        return new AdminDiagnosisResponse(history, user);
    }
}
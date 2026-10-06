package com.smartagriculture.backend.service;

import com.smartagriculture.backend.dto.AdminDiaryResponse;
import com.smartagriculture.backend.entity.FarmingDiary;
import com.smartagriculture.backend.repository.FarmingDiaryRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AdminDiaryService {

    private final FarmingDiaryRepository diaryRepository;

    public AdminDiaryService(
            FarmingDiaryRepository diaryRepository) {

        this.diaryRepository = diaryRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminDiaryResponse> getAll() {

        return diaryRepository.findAll()
                .stream()
                .map(AdminDiaryResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminDiaryResponse getById(Long id) {

        FarmingDiary diary = diaryRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Không tìm thấy nhật ký canh tác"
                        )
                );

        return new AdminDiaryResponse(diary);
    }
}
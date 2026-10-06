package com.smartagriculture.backend.service;

import com.smartagriculture.backend.dto.AdminSeasonResponse;
import com.smartagriculture.backend.entity.Season;
import com.smartagriculture.backend.repository.SeasonRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AdminSeasonService {

    private final SeasonRepository seasonRepository;

    public AdminSeasonService(SeasonRepository seasonRepository) {
        this.seasonRepository = seasonRepository;
    }

    // Admin xem tất cả mùa vụ
    public List<AdminSeasonResponse> getAll() {
        return seasonRepository.findAll()
                .stream()
                .map(AdminSeasonResponse::new)
                .toList();
    }

    // Admin xem/tìm mùa vụ theo ID
    public AdminSeasonResponse getById(Long id) {
        Season season = seasonRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Không tìm thấy mùa vụ"
                        )
                );

        return new AdminSeasonResponse(season);
    }
}
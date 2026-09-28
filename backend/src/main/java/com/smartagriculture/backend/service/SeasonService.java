package com.smartagriculture.backend.service;

import com.smartagriculture.backend.entity.Season;
import com.smartagriculture.backend.entity.User;
import com.smartagriculture.backend.repository.SeasonRepository;
import com.smartagriculture.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SeasonService {

    private final SeasonRepository seasonRepository;
    private final UserRepository userRepository;

    public SeasonService(
            SeasonRepository seasonRepository,
            UserRepository userRepository) {
        this.seasonRepository = seasonRepository;
        this.userRepository = userRepository;
    }

    // Lấy danh sách mùa vụ của một nông dân
    public List<Season> getByFarmer(Long farmerId) {
        return seasonRepository.findByFarmerId(farmerId);
    }

    // Xem chi tiết mùa vụ
    public Season getById(Long id) {
        return seasonRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Không tìm thấy mùa vụ"));
    }

    // Thêm mùa vụ
    public Season create(Long farmerId, Season season) {
        User farmer = userRepository.findById(farmerId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Không tìm thấy nông dân"));

        validateDates(season);
        season.setId(null);
        season.setFarmer(farmer);

        return seasonRepository.save(season);
    }

    // Cập nhật mùa vụ
    public Season update(Long id, Season request) {
        Season existing = getById(id);

        validateDates(request);

        existing.setName(request.getName());
        existing.setCrop(request.getCrop());
        existing.setArea(request.getArea());
        existing.setStart(request.getStart());
        existing.setEnd(request.getEnd());
        existing.setStatus(request.getStatus());

        return seasonRepository.save(existing);
    }

    // Xóa mùa vụ
    public void delete(Long id) {
        Season season = getById(id);
        seasonRepository.delete(season);
    }

    // Kiểm tra ngày bắt đầu và ngày kết thúc
    private void validateDates(Season season) {
        if (season.getStart() != null
                && season.getEnd() != null
                && season.getEnd().isBefore(season.getStart())) {
            throw new IllegalArgumentException(
                    "Ngày kết thúc không được trước ngày bắt đầu");
        }
    }
}
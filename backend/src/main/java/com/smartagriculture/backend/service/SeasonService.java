
package com.smartagriculture.backend.service;

import com.smartagriculture.backend.dto.SeasonRequest;
import com.smartagriculture.backend.dto.SeasonResponse;
import com.smartagriculture.backend.entity.Season;
import com.smartagriculture.backend.entity.User;
import com.smartagriculture.backend.repository.SeasonRepository;
import com.smartagriculture.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
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

    // Danh sách mùa vụ theo tài khoản nông dân
    public List<SeasonResponse> getByFarmer(Long farmerId) {
        requireActiveUser(farmerId);

        return seasonRepository.findByFarmerId(farmerId)
                .stream()
                .map(SeasonResponse::new)
                .toList();
    }

    // Chi tiết mùa vụ
    public SeasonResponse getById(Long id, Long farmerId) {
        return new SeasonResponse(
                findOwnedSeason(id, farmerId)
        );
    }

    // Thêm mùa vụ
    public SeasonResponse create(
            Long farmerId,
            SeasonRequest request) {

        User farmer = requireActiveUser(farmerId);

        Season season = new Season();
        copyFields(season, request);
        season.setFarmer(farmer);

        return new SeasonResponse(
                seasonRepository.save(season)
        );
    }

    // Sửa mùa vụ
    public SeasonResponse update(
            Long id,
            Long farmerId,
            SeasonRequest request) {

        Season season = findOwnedSeason(id, farmerId);
        copyFields(season, request);

        return new SeasonResponse(
                seasonRepository.save(season)
        );
    }

    // Xóa mùa vụ
    public void delete(Long id, Long farmerId) {
        Season season = findOwnedSeason(id, farmerId);
        seasonRepository.delete(season);
    }

    private User requireActiveUser(Long farmerId) {
        if (farmerId == null) {
            throw new IllegalArgumentException(
                    "Thiếu ID tài khoản nông dân");
        }

        User user = userRepository.findById(farmerId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Không tìm thấy tài khoản"));

        if (!"active".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalArgumentException(
                    "Tài khoản không hoạt động");
        }

        return user;
    }

    private Season findOwnedSeason(Long id, Long farmerId) {
        requireActiveUser(farmerId);

        Season season = seasonRepository.findById(id)
        .orElseThrow(() ->
                new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy mùa vụ"));
       if (!season.getFarmer().getId().equals(farmerId)) {
    throw new ResponseStatusException(
            HttpStatus.FORBIDDEN,
            "Mùa vụ không thuộc tài khoản này");
}

        return season;
    }

    private void copyFields(
            Season season,
            SeasonRequest request) {

        season.setName(request.getName());
        season.setCrop(request.getCrop());
        season.setArea(request.getArea());
        season.setStart(request.getStart());
        season.setEnd(request.getEnd());
        season.setStatus(request.getStatus());
    }
}

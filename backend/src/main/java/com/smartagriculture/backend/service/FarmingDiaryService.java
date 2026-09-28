
package com.smartagriculture.backend.service;

import com.smartagriculture.backend.dto.FarmingDiaryRequest;
import com.smartagriculture.backend.dto.FarmingDiaryResponse;
import com.smartagriculture.backend.entity.FarmingDiary;
import com.smartagriculture.backend.entity.Season;
import com.smartagriculture.backend.entity.User;
import com.smartagriculture.backend.repository.FarmingDiaryRepository;
import com.smartagriculture.backend.repository.SeasonRepository;
import com.smartagriculture.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FarmingDiaryService {

    private final FarmingDiaryRepository diaryRepository;
    private final SeasonRepository seasonRepository;
    private final UserRepository userRepository;

    public FarmingDiaryService(
            FarmingDiaryRepository diaryRepository,
            SeasonRepository seasonRepository,
            UserRepository userRepository) {

        this.diaryRepository = diaryRepository;
        this.seasonRepository = seasonRepository;
        this.userRepository = userRepository;
    }

    // Lấy danh sách nhật ký của một mùa vụ
    @Transactional(readOnly = true)
    public List<FarmingDiaryResponse> getBySeason(
            Long seasonId, Long farmerId) {

        findOwnedSeason(seasonId, farmerId);
        return diaryRepository
                .findBySeasonIdOrderByActivityDateDescIdDesc(seasonId)
                .stream()
                .map(FarmingDiaryResponse::new)
                .toList();
    }

    // Xem chi tiết nhật ký
    @Transactional(readOnly = true)
    public FarmingDiaryResponse getById(
            Long seasonId, Long diaryId, Long farmerId) {

        return new FarmingDiaryResponse(
                findOwnedDiary(seasonId, diaryId, farmerId)
        );
    }

    // Thêm nhật ký
    @Transactional
    public FarmingDiaryResponse create(
            Long seasonId,
            Long farmerId,
            FarmingDiaryRequest request) {

        Season season = findOwnedSeason(seasonId, farmerId);

        FarmingDiary diary = new FarmingDiary();
        diary.setSeason(season);
        copyFields(diary, request);

        return new FarmingDiaryResponse(
                diaryRepository.save(diary)
        );
    }

    // Cập nhật nhật ký
    @Transactional
    public FarmingDiaryResponse update(
            Long seasonId,
            Long diaryId,
            Long farmerId,
            FarmingDiaryRequest request) {

        FarmingDiary diary =
                findOwnedDiary(seasonId, diaryId, farmerId);

        copyFields(diary, request);

        return new FarmingDiaryResponse(
                diaryRepository.save(diary)
        );
    }

    // Xóa nhật ký
    @Transactional
    public void delete(
            Long seasonId, Long diaryId, Long farmerId) {

        FarmingDiary diary =
                findOwnedDiary(seasonId, diaryId, farmerId);

        diaryRepository.delete(diary);
    }

    private Season findOwnedSeason(
            Long seasonId, Long farmerId) {

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
Season season = seasonRepository.findById(seasonId)
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

    private FarmingDiary findOwnedDiary(
            Long seasonId, Long diaryId, Long farmerId) {

        findOwnedSeason(seasonId, farmerId);

       FarmingDiary diary = diaryRepository.findById(diaryId)
        .orElseThrow(() ->
                new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy nhật ký canh tác"));

        if (!diary.getSeason().getId().equals(seasonId)) {
            throw new IllegalArgumentException(
                    "Nhật ký không thuộc mùa vụ này");
        }

        return diary;
    }

    private void copyFields(
            FarmingDiary diary,
            FarmingDiaryRequest request) {

        diary.setActivityDate(request.getActivityDate());
        diary.setActivityType(request.getActivityType());
        diary.setContent(request.getContent());
        diary.setWaterAmount(request.getWaterAmount());
        diary.setFertilizerAmount(request.getFertilizerAmount());
        diary.setPesticideAmount(request.getPesticideAmount());
        diary.setNotes(request.getNotes());
    }
}

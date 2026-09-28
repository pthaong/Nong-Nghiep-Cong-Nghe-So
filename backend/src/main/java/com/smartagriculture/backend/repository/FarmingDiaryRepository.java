
package com.smartagriculture.backend.repository;

import com.smartagriculture.backend.entity.FarmingDiary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FarmingDiaryRepository
        extends JpaRepository<FarmingDiary, Long> {

    // Lấy nhật ký của một mùa vụ, mới nhất trước
    List<FarmingDiary> findBySeasonIdOrderByActivityDateDescIdDesc(
            Long seasonId);
}

package com.smartagriculture.backend.repository;

import com.smartagriculture.backend.entity.Season;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeasonRepository extends JpaRepository<Season, Long> {

    List<Season> findByFarmerId(Long farmerId);
}
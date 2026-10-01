package com.smartagriculture.backend.repository;

import com.smartagriculture.backend.entity.Plant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlantRepository extends JpaRepository<Plant, Long> {

    List<Plant> findByUserId(Long userId);
}
package com.smartagriculture.backend.repository;

import com.smartagriculture.backend.entity.Crop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CropRepository extends JpaRepository<Crop, Long> {

    List<Crop> findByNameContainingIgnoreCase(String name);

    List<Crop> findByPlantTypeIgnoreCase(String plantType);
}
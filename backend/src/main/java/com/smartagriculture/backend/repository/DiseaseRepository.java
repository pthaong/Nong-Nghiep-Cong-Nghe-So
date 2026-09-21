package com.smartagriculture.backend.repository;

import com.smartagriculture.backend.entity.Disease;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiseaseRepository extends JpaRepository<Disease, Long> {
}
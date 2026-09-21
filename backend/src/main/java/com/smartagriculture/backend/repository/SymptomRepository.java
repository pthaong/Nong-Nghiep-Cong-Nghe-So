package com.smartagriculture.backend.repository;

import com.smartagriculture.backend.entity.Symptom;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SymptomRepository extends JpaRepository<Symptom, Long> {
}
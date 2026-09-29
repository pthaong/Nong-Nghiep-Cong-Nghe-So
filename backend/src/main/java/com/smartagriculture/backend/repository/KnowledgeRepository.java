package com.smartagriculture.backend.repository;

import com.smartagriculture.backend.entity.Knowledge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface KnowledgeRepository
        extends JpaRepository<Knowledge, Long> {

    List<Knowledge> findByTitleContainingIgnoreCase(String keyword);

    List<Knowledge> findByPlantTypeContainingIgnoreCase(String plantType);
}
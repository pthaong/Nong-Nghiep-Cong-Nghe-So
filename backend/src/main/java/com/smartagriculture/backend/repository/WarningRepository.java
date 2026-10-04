package com.smartagriculture.backend.repository;

import com.smartagriculture.backend.entity.Warning;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WarningRepository extends JpaRepository<Warning, Long> {

List<Warning> findByAreaIgnoreCase(String area);

List<Warning> findByLevelIgnoreCase(String level);

}
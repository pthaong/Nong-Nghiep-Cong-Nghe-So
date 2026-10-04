package com.smartagriculture.backend.service;

import com.smartagriculture.backend.entity.Warning;
import com.smartagriculture.backend.repository.WarningRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class WarningService {

private final WarningRepository warningRepository;

public WarningService(WarningRepository warningRepository) {
    this.warningRepository = warningRepository;
}

// =========================
// GET ALL / FILTER
// =========================

public List<Warning> getAll(String area, String level) {

    if (area != null && !area.isBlank()) {
        return warningRepository.findByAreaIgnoreCase(area);
    }

    if (level != null && !level.isBlank()) {
        return warningRepository.findByLevelIgnoreCase(level);
    }

    return warningRepository.findAll();
}

// =========================
// GET BY ID
// =========================

public Warning getById(Long id) {

    return warningRepository.findById(id)
            .orElseThrow(() ->
                    new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Không tìm thấy cảnh báo với id: " + id
                    )
            );
}

// =========================
// CREATE
// =========================

public Warning create(Warning warning) {

    warning.setTitle(warning.getTitle());
    warning.setMessage(warning.getMessage());
    warning.setType(warning.getType());
    warning.setLevel(warning.getLevel());
    warning.setArea(warning.getArea());

    return warningRepository.save(warning);
}

// =========================
// UPDATE
// =========================

public Warning update(Long id, Warning warning) {

    Warning existing = getById(id);

    existing.setTitle(warning.getTitle());
    existing.setMessage(warning.getMessage());
    existing.setType(warning.getType());
    existing.setLevel(warning.getLevel());
    existing.setArea(warning.getArea());

    return warningRepository.save(existing);
}

// =========================
// DELETE
// =========================

public void delete(Long id) {

    if (!warningRepository.existsById(id)) {

        throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Không tìm thấy cảnh báo với id: " + id
        );
    }

    warningRepository.deleteById(id);
}

}
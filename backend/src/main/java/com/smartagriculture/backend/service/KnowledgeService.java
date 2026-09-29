package com.smartagriculture.backend.service;

import com.smartagriculture.backend.entity.Knowledge;
import com.smartagriculture.backend.repository.KnowledgeRepository;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class KnowledgeService {

    private final KnowledgeRepository knowledgeRepository;

    public KnowledgeService(KnowledgeRepository knowledgeRepository) {
        this.knowledgeRepository = knowledgeRepository;
    }

    // Lấy danh sách kiến thức
    public List<Knowledge> getAll() {
        return knowledgeRepository.findAll();
    }

    // Lấy chi tiết kiến thức
   public Knowledge getById(Long id) {
    return knowledgeRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy kiến thức với ID: " + id
            ));
}

    // Tìm kiếm theo tiêu đề
    public List<Knowledge> search(String keyword) {
        return knowledgeRepository
                .findByTitleContainingIgnoreCase(keyword);
    }
}
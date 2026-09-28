package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.entity.Knowledge;
import com.smartagriculture.backend.service.KnowledgeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/knowledge")
public class KnowledgeController {

    private final KnowledgeService knowledgeService;

    public KnowledgeController(KnowledgeService knowledgeService) {
        this.knowledgeService = knowledgeService;
    }

    @GetMapping
    public ResponseEntity<List<Knowledge>> getAll() {
        return ResponseEntity.ok(
                knowledgeService.getAll()
        );
    }

    @GetMapping("/search")
    public ResponseEntity<List<Knowledge>> search(
            @RequestParam String keyword) {

        return ResponseEntity.ok(
                knowledgeService.search(keyword)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Knowledge> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                knowledgeService.getById(id)
        );
    }
}
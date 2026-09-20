package com.smartagriculture.backend.entity;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "symptoms")
public class Symptom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tên triệu chứng
    @Column(nullable = false, length = 255)
    private String name;

    // Mô tả triệu chứng
    @Lob
    private String description;

    // Quan hệ nhiều-nhiều với Disease
    @ManyToMany(mappedBy = "symptoms")
    private Set<Disease> diseases = new HashSet<>();

    public Symptom() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<Disease> getDiseases() {
        return diseases;
    }

    public void setDiseases(Set<Disease> diseases) {
        this.diseases = diseases;
    }
}
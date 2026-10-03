package com.smartagriculture.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "crops")
public class Crop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "plant_type")
    private String plantType;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "growing_season")
    private String growingSeason;

    @Column(name = "growth_time")
    private Integer growthTime;

    @Column(name = "care_guide", columnDefinition = "NVARCHAR(MAX)")
    private String careGuide;

    public Crop() {
    }

    public Crop(
            String name,
            String plantType,
            String description,
            String growingSeason,
            Integer growthTime,
            String careGuide
    ) {
        this.name = name;
        this.plantType = plantType;
        this.description = description;
        this.growingSeason = growingSeason;
        this.growthTime = growthTime;
        this.careGuide = careGuide;
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

    public String getPlantType() {
        return plantType;
    }

    public void setPlantType(String plantType) {
        this.plantType = plantType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getGrowingSeason() {
        return growingSeason;
    }

    public void setGrowingSeason(String growingSeason) {
        this.growingSeason = growingSeason;
    }

    public Integer getGrowthTime() {
        return growthTime;
    }

    public void setGrowthTime(Integer growthTime) {
        this.growthTime = growthTime;
    }

    public String getCareGuide() {
        return careGuide;
    }

    public void setCareGuide(String careGuide) {
        this.careGuide = careGuide;
    }
}
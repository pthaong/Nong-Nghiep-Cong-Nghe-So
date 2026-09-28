package com.smartagriculture.backend.dto;

import com.smartagriculture.backend.entity.Season;

import java.math.BigDecimal;
import java.time.LocalDate;

public class SeasonResponse {

    private Long id;
    private String name;
    private String crop;
    private BigDecimal area;
    private LocalDate start;
    private LocalDate end;
    private String status;

    public SeasonResponse(Season season) {
        this.id = season.getId();
        this.name = season.getName();
        this.crop = season.getCrop();
        this.area = season.getArea();
        this.start = season.getStart();
        this.end = season.getEnd();
        this.status = season.getStatus();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCrop() {
        return crop;
    }

    public BigDecimal getArea() {
        return area;
    }

    public LocalDate getStart() {
        return start;
    }

    public LocalDate getEnd() {
        return end;
    }

    public String getStatus() {
        return status;
    }
}
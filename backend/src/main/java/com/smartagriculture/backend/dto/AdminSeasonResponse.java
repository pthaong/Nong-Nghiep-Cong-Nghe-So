package com.smartagriculture.backend.dto;

import com.smartagriculture.backend.entity.Season;

import java.math.BigDecimal;
import java.time.LocalDate;

public class AdminSeasonResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String phone;
    private String name;
    private String crop;
    private BigDecimal area;
    private LocalDate start;
    private LocalDate end;
    private String status;

    public AdminSeasonResponse(Season season) {
        this.id = season.getId();

        if (season.getFarmer() != null) {
            this.userId = season.getFarmer().getId();
            this.userName = season.getFarmer().getName();
            this.phone = season.getFarmer().getPhone();
        }

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

    public Long getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
    }

    public String getPhone() {
        return phone;
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
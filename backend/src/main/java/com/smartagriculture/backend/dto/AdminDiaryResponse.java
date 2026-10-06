package com.smartagriculture.backend.dto;

import com.smartagriculture.backend.entity.FarmingDiary;
import com.smartagriculture.backend.entity.Season;
import com.smartagriculture.backend.entity.User;

import java.math.BigDecimal;
import java.time.LocalDate;

public class AdminDiaryResponse {

    private Long id;

    private Long seasonId;
    private String seasonName;

    private Long userId;
    private String userName;
    private String phone;

    private LocalDate activityDate;
    private String activityType;
    private String content;

    private BigDecimal waterAmount;
    private BigDecimal fertilizerAmount;
    private BigDecimal pesticideAmount;

    private String notes;

    public AdminDiaryResponse(FarmingDiary diary) {

        this.id = diary.getId();

        Season season = diary.getSeason();

        if (season != null) {
            this.seasonId = season.getId();
            this.seasonName = season.getName();

            User farmer = season.getFarmer();

            if (farmer != null) {
                this.userId = farmer.getId();
                this.userName = farmer.getName();
                this.phone = farmer.getPhone();
            }
        }

        this.activityDate = diary.getActivityDate();
        this.activityType = diary.getActivityType();
        this.content = diary.getContent();

        this.waterAmount = diary.getWaterAmount();
        this.fertilizerAmount = diary.getFertilizerAmount();
        this.pesticideAmount = diary.getPesticideAmount();

        this.notes = diary.getNotes();
    }

    public Long getId() {
        return id;
    }

    public Long getSeasonId() {
        return seasonId;
    }

    public String getSeasonName() {
        return seasonName;
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

    public LocalDate getActivityDate() {
        return activityDate;
    }

    public String getActivityType() {
        return activityType;
    }

    public String getContent() {
        return content;
    }

    public BigDecimal getWaterAmount() {
        return waterAmount;
    }

    public BigDecimal getFertilizerAmount() {
        return fertilizerAmount;
    }

    public BigDecimal getPesticideAmount() {
        return pesticideAmount;
    }

    public String getNotes() {
        return notes;
    }
}

package com.smartagriculture.backend.dto;

import com.smartagriculture.backend.entity.FarmingDiary;

import java.math.BigDecimal;
import java.time.LocalDate;

public class FarmingDiaryResponse {

    private Long id;
    private Long seasonId;
    private LocalDate activityDate;
    private String activityType;
    private String content;
    private BigDecimal waterAmount;
    private BigDecimal fertilizerAmount;
    private BigDecimal pesticideAmount;
    private String notes;

    public FarmingDiaryResponse(FarmingDiary diary) {
        this.id = diary.getId();
        this.seasonId = diary.getSeason().getId();
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

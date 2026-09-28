
package com.smartagriculture.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "farming_diaries")
public class FarmingDiary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "season_id", nullable = false)
    private Season season;

    @Column(name = "activity_date", nullable = false)
    private LocalDate activityDate;

    @Column(name = "activity_type", nullable = false, length = 100)
    private String activityType;

    @Column(nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String content;

    @DecimalMin(value = "0.0")
    @Column(name = "water_amount", precision = 12, scale = 2)
    private BigDecimal waterAmount;

    @DecimalMin(value = "0.0")
    @Column(name = "fertilizer_amount", precision = 12, scale = 2)
    private BigDecimal fertilizerAmount;

    @DecimalMin(value = "0.0")
    @Column(name = "pesticide_amount", precision = 12, scale = 2)
    private BigDecimal pesticideAmount;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String notes;

    public FarmingDiary() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Season getSeason() {
        return season;
    }

    public void setSeason(Season season) {
        this.season = season;
    }

    public LocalDate getActivityDate() {
        return activityDate;
    }

    public void setActivityDate(LocalDate activityDate) {
        this.activityDate = activityDate;
    }

    public String getActivityType() {
        return activityType;
    }

    public void setActivityType(String activityType) {
        this.activityType = activityType;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public BigDecimal getWaterAmount() {
        return waterAmount;
    }

    public void setWaterAmount(BigDecimal waterAmount) {
        this.waterAmount = waterAmount;
    }

    public BigDecimal getFertilizerAmount() {
        return fertilizerAmount;
    }

    public void setFertilizerAmount(BigDecimal fertilizerAmount) {
        this.fertilizerAmount = fertilizerAmount;
    }

    public BigDecimal getPesticideAmount() {
        return pesticideAmount;
    }

    public void setPesticideAmount(BigDecimal pesticideAmount) {
        this.pesticideAmount = pesticideAmount;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

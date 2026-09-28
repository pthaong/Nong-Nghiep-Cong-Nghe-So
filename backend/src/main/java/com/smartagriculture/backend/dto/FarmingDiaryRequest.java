
package com.smartagriculture.backend.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public class FarmingDiaryRequest {

    @NotNull(message = "Ngày thực hiện không được để trống")
    private LocalDate activityDate;

    @NotBlank(message = "Loại hoạt động không được để trống")
    @Size(max = 100, message = "Loại hoạt động tối đa 100 ký tự")
    private String activityType;

    @NotBlank(message = "Nội dung không được để trống")
    private String content;

    @DecimalMin(
            value = "0.0",
            message = "Lượng nước không được âm"
    )
    @Digits(integer = 10, fraction = 2)
    private BigDecimal waterAmount;

    @DecimalMin(
            value = "0.0",
            message = "Lượng phân bón không được âm"
    )
    @Digits(integer = 10, fraction = 2)
    private BigDecimal fertilizerAmount;

    @DecimalMin(
            value = "0.0",
            message = "Lượng thuốc bảo vệ thực vật không được âm"
    )
    @Digits(integer = 10, fraction = 2)
    private BigDecimal pesticideAmount;

    private String notes;

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

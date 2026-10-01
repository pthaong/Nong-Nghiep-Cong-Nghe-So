package com.smartagriculture.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class CommodityPriceRequest {

    @NotBlank(message = "Loại nông sản không được để trống")
    private String commodityType;

    @NotNull(message = "Giá không được để trống")
    @DecimalMin(
            value = "0.0",
            inclusive = false,
            message = "Giá phải lớn hơn 0"
    )
    private BigDecimal price;

    @NotBlank(message = "Đơn vị không được để trống")
    private String unit;

    public CommodityPriceRequest() {
    }

    public String getCommodityType() {
        return commodityType;
    }

    public void setCommodityType(String commodityType) {
        this.commodityType = commodityType;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }
}
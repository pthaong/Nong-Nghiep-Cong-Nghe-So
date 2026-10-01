package com.smartagriculture.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CommodityPriceResponse {

    private Long id;
    private String commodityType;
    private BigDecimal price;
    private String unit;
    private LocalDateTime updatedAt;
    private String source;

    public CommodityPriceResponse() {
    }

    public CommodityPriceResponse(
            Long id,
            String commodityType,
            BigDecimal price,
            String unit,
            LocalDateTime updatedAt,
            String source
    ) {
        this.id = id;
        this.commodityType = commodityType;
        this.price = price;
        this.unit = unit;
        this.updatedAt = updatedAt;
        this.source = source;
    }

    public Long getId() {
        return id;
    }

    public String getCommodityType() {
        return commodityType;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public String getUnit() {
        return unit;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public String getSource() {
        return source;
    }
}
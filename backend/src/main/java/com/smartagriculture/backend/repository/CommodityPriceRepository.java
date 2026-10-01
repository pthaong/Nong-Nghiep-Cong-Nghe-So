package com.smartagriculture.backend.repository;

import com.smartagriculture.backend.entity.CommodityPrice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommodityPriceRepository
        extends JpaRepository<CommodityPrice, Long> {

    List<CommodityPrice> findByCommodityTypeIgnoreCase(
            String commodityType
    );
}
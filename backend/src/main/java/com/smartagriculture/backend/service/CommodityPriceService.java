package com.smartagriculture.backend.service;

import com.smartagriculture.backend.dto.CommodityPriceRequest;
import com.smartagriculture.backend.dto.CommodityPriceResponse;
import com.smartagriculture.backend.entity.CommodityPrice;
import com.smartagriculture.backend.repository.CommodityPriceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommodityPriceService {

    private final CommodityPriceRepository repository;

    public CommodityPriceService(
            CommodityPriceRepository repository
    ) {
        this.repository = repository;
    }

    public List<CommodityPriceResponse> getAll(
            String commodityType
    ) {

        List<CommodityPrice> prices;

        if (commodityType != null &&
                !commodityType.isBlank()) {

            prices = repository
                    .findByCommodityTypeIgnoreCase(
                            commodityType
                    );

        } else {

            prices = repository.findAll();
        }

        return prices.stream()
                .map(this::toResponse)
                .toList();
    }

    public CommodityPriceResponse getById(Long id) {

        CommodityPrice price =
                repository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy giá nông sản với id: "
                                                + id
                                )
                        );

        return toResponse(price);
    }

    public CommodityPriceResponse create(
            CommodityPriceRequest request
    ) {

        CommodityPrice price = new CommodityPrice();

        price.setCommodityType(
                request.getCommodityType()
        );

        price.setPrice(
                request.getPrice()
        );

        price.setUnit(
                request.getUnit()
        );

        CommodityPrice saved =
                repository.save(price);

        return toResponse(saved);
    }

    public CommodityPriceResponse update(
            Long id,
            CommodityPriceRequest request
    ) {

        CommodityPrice price =
                repository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Không tìm thấy giá nông sản với id: "
                                                + id
                                )
                        );

        price.setCommodityType(
                request.getCommodityType()
        );

        price.setPrice(
                request.getPrice()
        );

        price.setUnit(
                request.getUnit()
        );

        CommodityPrice updated =
                repository.save(price);

        return toResponse(updated);
    }

    public void delete(Long id) {

        if (!repository.existsById(id)) {

            throw new RuntimeException(
                    "Không tìm thấy giá nông sản với id: "
                            + id
            );
        }

        repository.deleteById(id);
    }

    private CommodityPriceResponse toResponse(
            CommodityPrice price
    ) {

        return new CommodityPriceResponse(
                price.getId(),
                price.getCommodityType(),
                price.getPrice(),
                price.getUnit(),
                price.getUpdatedAt(),
                "internal"
        );
    }
}
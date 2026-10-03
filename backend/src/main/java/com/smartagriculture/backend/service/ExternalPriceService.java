package com.smartagriculture.backend.service;

import com.smartagriculture.backend.dto.CommodityPriceResponse;
import org.springframework.http.HttpMethod;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.math.BigDecimal;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExternalPriceService {

    private static final String SQL_URL =
            "https://data.apps.fao.org/catalog/dataset/" +
            "ab62e545-a3ce-44d7-ab0d-9728cb638cc2/resource/" +
            "d30487a2-82f2-4f97-a711-935d64eab444/download/" +
            "prices-pp-producer-prices-query.sql";

    private static final String API_URL =
            "https://api.data.apps.fao.org/api/v2/bigquery";

    private final SimpleClientHttpRequestFactory requestFactory;

    public ExternalPriceService() {
        this.requestFactory = new SimpleClientHttpRequestFactory();
        this.requestFactory.setConnectTimeout(5000);
        this.requestFactory.setReadTimeout(30000);
    }
public List<CommodityPriceResponse> getLatestExternalPrices() {

    // Các mặt hàng FAOSTAT dùng cho trang Giá nông sản.
    List<Integer> itemCodes = List.of(
            15,   // Wheat
            221   // Almonds, in shell
    );

    List<CommodityPriceResponse> latestPrices =
            new ArrayList<>();

    for (Integer itemCode : itemCodes) {

        List<CommodityPriceResponse> prices =
                getExternalPrices(itemCode);

        CommodityPriceResponse latest = prices.stream()
                // Không đưa fallback/sample lên màn hình dữ liệu thật.
                .filter(price ->
                        "FAOSTAT".equalsIgnoreCase(
                                price.getSource()
                        )
                )
                .filter(price ->
                        price.getUpdatedAt() != null
                )
                .max((first, second) ->
                        first.getUpdatedAt()
                                .compareTo(
                                        second.getUpdatedAt()
                                )
                )
                .orElse(null);

        if (latest != null) {
            latestPrices.add(latest);
        }
    }

    return latestPrices;
}
    public List<CommodityPriceResponse> getExternalPrices(
            Integer itemCode
    ) {

        int code = itemCode != null ? itemCode : 221;

        try {
            String url = API_URL
                    + "?sql_url="
                    + URLEncoder.encode(
                            SQL_URL,
                            StandardCharsets.UTF_8
                    )
                    + "&frequency=monthly"
                    + "&item_code=" + code
                    + "&download=true";

            URI requestUri = URI.create(url);

            String csv;

            try (var response = requestFactory
                    .createRequest(
                            requestUri,
                            HttpMethod.GET
                    )
                    .execute()) {

                try (InputStream inputStream = response.getBody()) {
                    csv = new String(
                            inputStream.readAllBytes(),
                            StandardCharsets.UTF_8
                    );
                }
            }

            List<CommodityPriceResponse> prices =
                    parseCsv(csv);

            if (prices.isEmpty()) {
                return fallbackData();
            }

            return prices;

        } catch (Exception exception) {
            return fallbackData();
        }
    }

    private List<CommodityPriceResponse> parseCsv(String csv) {

        List<CommodityPriceResponse> result =
                new ArrayList<>();

        if (csv == null || csv.isBlank()) {
            return result;
        }

        String[] lines = csv.split("\\R");

        if (lines.length < 2) {
            return result;
        }

        List<String> headers =
                parseCsvLine(lines[0]);

        int itemIndex =
                headers.indexOf("item");

        int priceIndex =
                headers.indexOf(
                        "producer_price_lcu_tonne_lcu"
                );

        int dateIndex =
                headers.indexOf("date");

        if (itemIndex < 0 ||
                priceIndex < 0 ||
                dateIndex < 0) {

            return result;
        }

        for (int i = 1;
             i < lines.length && result.size() < 20;
             i++) {

            try {
                List<String> values =
                        parseCsvLine(lines[i]);

                if (values.size() <= itemIndex ||
                        values.size() <= priceIndex ||
                        values.size() <= dateIndex) {

                    continue;
                }

                String item =
                        values.get(itemIndex);

                String priceText =
                        values.get(priceIndex);

                String dateText =
                        values.get(dateIndex);

                if (item == null ||
                        item.isBlank() ||
                        priceText == null ||
                        priceText.isBlank() ||
                        dateText == null ||
                        dateText.isBlank()) {

                    continue;
                }

                BigDecimal price =
                        new BigDecimal(priceText);

                LocalDateTime updatedAt =
                        LocalDate.parse(dateText)
                                .atStartOfDay();

                result.add(
                        new CommodityPriceResponse(
                                null,
                                item,
                                price,
                                "LCU/tonne",
                                updatedAt,
                                "FAOSTAT"
                        )
                );

            } catch (Exception ignored) {
                // Bỏ qua bản ghi ngoài có dữ liệu sai định dạng.
            }
        }

        return result;
    }

    private List<String> parseCsvLine(String line) {

        List<String> values =
                new ArrayList<>();

        StringBuilder current =
                new StringBuilder();

        boolean insideQuotes = false;

        for (int i = 0; i < line.length(); i++) {

            char c = line.charAt(i);

            if (c == '"') {

                if (insideQuotes &&
                        i + 1 < line.length() &&
                        line.charAt(i + 1) == '"') {

                    current.append('"');
                    i++;

                } else {
                    insideQuotes = !insideQuotes;
                }

            } else if (c == ',' && !insideQuotes) {

                values.add(
                        current.toString().trim()
                );

                current.setLength(0);

            } else {
                current.append(c);
            }
        }

        values.add(
                current.toString().trim()
        );

        return values;
    }

    private List<CommodityPriceResponse> fallbackData() {

        LocalDateTime now =
                LocalDateTime.now();

        return List.of(
                new CommodityPriceResponse(
                        null,
                        "Rice",
                        new BigDecimal("520.00"),
                        "USD/tonne",
                        now,
                        "fallback/sample"
                ),
                new CommodityPriceResponse(
                        null,
                        "Maize",
                        new BigDecimal("240.00"),
                        "USD/tonne",
                        now,
                        "fallback/sample"
                )
        );
    }
}
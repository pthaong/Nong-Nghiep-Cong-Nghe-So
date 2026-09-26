package com.smartagriculture.backend.service;

import com.smartagriculture.backend.dto.WeatherResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.Map;

@Service
public class WeatherService {

    private final RestClient restClient;

    private final Map<String, double[]> locations = new HashMap<>();

    public WeatherService(RestClient.Builder builder) {

        this.restClient = builder.build();

        // Hà Nội
        locations.put("hanoi", new double[]{21.0285, 105.8542});
        locations.put("ha noi", new double[]{21.0285, 105.8542});

        // TP Hồ Chí Minh
        locations.put("hochiminh", new double[]{10.8231, 106.6297});
        locations.put("ho chi minh", new double[]{10.8231, 106.6297});
        locations.put("tp hcm", new double[]{10.8231, 106.6297});

        // Đà Nẵng
        locations.put("danang", new double[]{16.0544, 108.2022});
        locations.put("da nang", new double[]{16.0544, 108.2022});

        // Hải Phòng
        locations.put("haiphong", new double[]{20.8449, 106.6881});
        locations.put("hai phong", new double[]{20.8449, 106.6881});

        // Cần Thơ
        locations.put("cantho", new double[]{10.0452, 105.7469});
        locations.put("can tho", new double[]{10.0452, 105.7469});

        // Nha Trang
        locations.put("nhatrang", new double[]{12.2388, 109.1967});
        locations.put("nha trang", new double[]{12.2388, 109.1967});

        // Đà Lạt
        locations.put("dalat", new double[]{11.9404, 108.4583});
        locations.put("da lat", new double[]{11.9404, 108.4583});
    }

    public WeatherResponse getWeather(String location) {

        String key = location.trim().toLowerCase();

        double[] coordinates = locations.get(key);

        if (coordinates == null) {
            throw new IllegalArgumentException(
                    "Không tìm thấy khu vực: " + location
            );
        }

        double latitude = coordinates[0];
        double longitude = coordinates[1];

        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("https")
                        .host("api.open-meteo.com")
                        .path("/v1/forecast")
                        .queryParam("latitude", latitude)
                        .queryParam("longitude", longitude)
                        .queryParam(
                                "current",
                                "temperature_2m," +
                                "relative_humidity_2m," +
                                "wind_speed_10m"
                        )
                        .build())
                .retrieve()
                .body(WeatherResponse.class);
    }
}
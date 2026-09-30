package com.smartagriculture.backend.service;

import com.smartagriculture.backend.dto.WeatherResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
public class WeatherService {

    private final RestClient restClient;

    public WeatherService(RestClient.Builder builder) {
        this.restClient = builder.build();
    }

    public WeatherResponse getWeather(String location) {

        if (location == null || location.isBlank()) {
            throw new IllegalArgumentException("Vui lòng nhập khu vực");
        }

        String searchLocation = location.trim();

        // Bước 1: tìm tọa độ thật từ tên tỉnh/thành bằng Open-Meteo Geocoding.
        GeocodingResponse geocodingResponse = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("https")
                        .host("geocoding-api.open-meteo.com")
                        .path("/v1/search")
                        .queryParam("name", searchLocation)
                        .queryParam("count", 10)
                        .queryParam("language", "vi")
                        .queryParam("format", "json")
                        .build())
                .retrieve()
                .body(GeocodingResponse.class);

        if (geocodingResponse == null
                || geocodingResponse.results == null
                || geocodingResponse.results.isEmpty()) {

            throw new IllegalArgumentException(
                    "Không tìm thấy khu vực: " + location
            );
        }

        // Ưu tiên kết quả thuộc Việt Nam.
        GeocodingResult selected = geocodingResponse.results.stream()
                .filter(result ->
                        "VN".equalsIgnoreCase(result.countryCode)
                                || "Vietnam".equalsIgnoreCase(result.country)
                                || "Việt Nam".equalsIgnoreCase(result.country)
                )
                .findFirst()
                .orElse(geocodingResponse.results.get(0));

        double latitude = selected.latitude;
        double longitude = selected.longitude;

        // Bước 2: lấy dữ liệu thời tiết hiện tại từ Open-Meteo.
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("https")
                        .host("api.open-meteo.com")
                        .path("/v1/forecast")
                        .queryParam("latitude", latitude)
                        .queryParam("longitude", longitude)
                        .queryParam(
                                "current",
                                "temperature_2m,"
                                        + "relative_humidity_2m,"
                                        + "wind_speed_10m"
                        )
                        .build())
                .retrieve()
                .body(WeatherResponse.class);
    }

    public static class GeocodingResponse {

        public List<GeocodingResult> results;

        public List<GeocodingResult> getResults() {
            return results;
        }

        public void setResults(List<GeocodingResult> results) {
            this.results = results;
        }
    }

    public static class GeocodingResult {

        public String name;
        public double latitude;
        public double longitude;
        public String country;
        public String countryCode;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public double getLatitude() {
            return latitude;
        }

        public void setLatitude(double latitude) {
            this.latitude = latitude;
        }

        public double getLongitude() {
            return longitude;
        }

        public void setLongitude(double longitude) {
            this.longitude = longitude;
        }

        public String getCountry() {
            return country;
        }

        public void setCountry(String country) {
            this.country = country;
        }

        public String getCountryCode() {
            return countryCode;
        }

        public void setCountryCode(String countryCode) {
            this.countryCode = countryCode;
        }
    }
}

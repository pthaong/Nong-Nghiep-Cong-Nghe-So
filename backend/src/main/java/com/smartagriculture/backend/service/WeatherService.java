package com.smartagriculture.backend.service;

import com.smartagriculture.backend.dto.WeatherResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class WeatherService {

    private final RestClient restClient;

    public WeatherService(RestClient.Builder builder) {
        this.restClient = builder
                .baseUrl("https://api.open-meteo.com")
                .build();
    }

    public WeatherResponse getWeather(double latitude, double longitude) {

        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1/forecast")
                        .queryParam("latitude", latitude)
                        .queryParam("longitude", longitude)
                        .queryParam(
                                "current",
                                "temperature_2m,relative_humidity_2m,wind_speed_10m"
                        )
                        .build())
                .retrieve()
                .body(WeatherResponse.class);
    }
}
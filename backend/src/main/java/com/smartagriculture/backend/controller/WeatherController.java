package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.dto.WeatherResponse;
import com.smartagriculture.backend.service.WeatherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping
    public ResponseEntity<WeatherResponse> getWeather(
            @RequestParam String location) {

        return ResponseEntity.ok(
                weatherService.getWeather(location)
        );
    }
}
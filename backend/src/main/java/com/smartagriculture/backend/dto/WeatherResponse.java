package com.smartagriculture.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class WeatherResponse {

    private double latitude;
    private double longitude;

    private CurrentWeather current;

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

    public CurrentWeather getCurrent() {
        return current;
    }

    public void setCurrent(CurrentWeather current) {
        this.current = current;
    }

    public static class CurrentWeather {

        @JsonProperty("temperature_2m")
        private double temperature;

        @JsonProperty("relative_humidity_2m")
        private double humidity;

        @JsonProperty("wind_speed_10m")
        private double windSpeed;

        public double getTemperature() {
            return temperature;
        }

        public void setTemperature(double temperature) {
            this.temperature = temperature;
        }

        public double getHumidity() {
            return humidity;
        }

        public void setHumidity(double humidity) {
            this.humidity = humidity;
        }

        public double getWindSpeed() {
            return windSpeed;
        }

        public void setWindSpeed(double windSpeed) {
            this.windSpeed = windSpeed;
        }
    }
}
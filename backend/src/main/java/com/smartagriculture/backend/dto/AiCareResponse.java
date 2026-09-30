package com.smartagriculture.backend.dto;

public class AiCareResponse {

    private boolean success;
    private String plantType;
    private String growthStage;
    private String watering;
    private String fertilizer;
    private String care;
    private String diseasePrevention;

    public AiCareResponse() {
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getPlantType() {
        return plantType;
    }

    public void setPlantType(String plantType) {
        this.plantType = plantType;
    }

    public String getGrowthStage() {
        return growthStage;
    }

    public void setGrowthStage(String growthStage) {
        this.growthStage = growthStage;
    }

    public String getWatering() {
        return watering;
    }

    public void setWatering(String watering) {
        this.watering = watering;
    }

    public String getFertilizer() {
        return fertilizer;
    }

    public void setFertilizer(String fertilizer) {
        this.fertilizer = fertilizer;
    }

    public String getCare() {
        return care;
    }

    public void setCare(String care) {
        this.care = care;
    }

    public String getDiseasePrevention() {
        return diseasePrevention;
    }

    public void setDiseasePrevention(String diseasePrevention) {
        this.diseasePrevention = diseasePrevention;
    }
}
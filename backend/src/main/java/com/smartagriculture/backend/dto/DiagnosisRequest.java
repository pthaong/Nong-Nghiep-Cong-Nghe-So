package com.smartagriculture.backend.dto;

public class DiagnosisRequest {

    private String plantType;
    private String symptoms;

    public DiagnosisRequest() {
    }

    public String getPlantType() {
        return plantType;
    }

    public void setPlantType(String plantType) {
        this.plantType = plantType;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }
}
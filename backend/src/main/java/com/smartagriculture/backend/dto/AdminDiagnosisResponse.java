package com.smartagriculture.backend.dto;

import com.smartagriculture.backend.entity.DiagnosisHistory;
import com.smartagriculture.backend.entity.User;

import java.time.LocalDateTime;

public class AdminDiagnosisResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String phone;

    private String plantType;
    private String symptoms;
    private String imageName;
    private String diseaseName;
    private String result;
    private String severity;
    private String cause;
    private String prevention;
    private String treatment;
    private LocalDateTime createdAt;

    public AdminDiagnosisResponse(
            DiagnosisHistory history,
            User user) {

        this.id = history.getId();
        this.userId = history.getUserId();

        this.userName = user != null
                ? user.getName()
                : "Không xác định";

        this.phone = user != null
                ? user.getPhone()
                : "";

        this.plantType = history.getPlantType();
        this.symptoms = history.getSymptoms();
        this.imageName = history.getImageName();
        this.diseaseName = history.getDiseaseName();
        this.result = history.getResult();
        this.severity = history.getSeverity();
        this.cause = history.getCause();
        this.prevention = history.getPrevention();
        this.treatment = history.getTreatment();
        this.createdAt = history.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
    }

    public String getPhone() {
        return phone;
    }

    public String getPlantType() {
        return plantType;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public String getImageName() {
        return imageName;
    }

    public String getDiseaseName() {
        return diseaseName;
    }

    public String getResult() {
        return result;
    }

    public String getSeverity() {
        return severity;
    }

    public String getCause() {
        return cause;
    }

    public String getPrevention() {
        return prevention;
    }

    public String getTreatment() {
        return treatment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
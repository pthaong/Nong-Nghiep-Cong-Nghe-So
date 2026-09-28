package com.smartagriculture.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "diagnosis_history")
public class DiagnosisHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "disease_id")
    private Disease disease;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String symptoms;

    @Column(name = "predicted_disease")
    private String predictedDisease;

    private Double confidence;

    private String severity;

    @Column(columnDefinition = "TEXT")
    private String cause;

    @Column(columnDefinition = "TEXT")
    private String prevention;

    @Column(columnDefinition = "TEXT")
    private String treatment;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public DiagnosisHistory() {
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Disease getDisease() {
        return disease;
    }

    public void setDisease(Disease disease) {
        this.disease = disease;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public String getPredictedDisease() {
        return predictedDisease;
    }

    public void setPredictedDisease(String predictedDisease) {
        this.predictedDisease = predictedDisease;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getCause() {
        return cause;
    }

    public void setCause(String cause) {
        this.cause = cause;
    }

    public String getPrevention() {
        return prevention;
    }

    public void setPrevention(String prevention) {
        this.prevention = prevention;
    }

    public String getTreatment() {
        return treatment;
    }

    public void setTreatment(String treatment) {
        this.treatment = treatment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
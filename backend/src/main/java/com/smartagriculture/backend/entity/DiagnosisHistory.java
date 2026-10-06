package com.smartagriculture.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "diagnosis_history")
public class DiagnosisHistory {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

// ID tài khoản nông dân thực hiện chẩn đoán
@Column(name = "user_id")
private Long userId;

// Loại cây
@Column(name = "plant_type", nullable = false, columnDefinition = "NVARCHAR(255)")
private String plantType;

// Triệu chứng người dùng nhập
@Column(name = "symptoms", columnDefinition = "NVARCHAR(MAX)")
private String symptoms;

// Tên file ảnh đã upload
@Column(name = "image_name")
private String imageName;

// Kết quả bệnh
@Column(name = "disease_name", columnDefinition = "NVARCHAR(255)")
private String diseaseName;

// Kết quả chẩn đoán đầy đủ
@Column(name = "result", columnDefinition = "NVARCHAR(MAX)")
private String result;

// Mức độ nghiêm trọng
@Column(name = "severity", columnDefinition = "NVARCHAR(255)")
private String severity;

// Nguyên nhân
@Column(name = "cause", columnDefinition = "NVARCHAR(MAX)")
private String cause;

// Cách phòng ngừa
@Column(name = "prevention", columnDefinition = "NVARCHAR(MAX)")
private String prevention;

// Cách xử lý
@Column(name = "treatment", columnDefinition = "NVARCHAR(MAX)")
private String treatment;

@Column(name = "created_at", nullable = false)
private LocalDateTime createdAt;

@PrePersist
protected void onCreate() {
    createdAt = LocalDateTime.now();
}

public DiagnosisHistory() {
}

public Long getId() {
    return id;
}

public void setId(Long id) {
    this.id = id;
}

public Long getUserId() {
    return userId;
}

public void setUserId(Long userId) {
    this.userId = userId;
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

public String getImageName() {
    return imageName;
}

public void setImageName(String imageName) {
    this.imageName = imageName;
}

public String getDiseaseName() {
    return diseaseName;
}

public void setDiseaseName(String diseaseName) {
    this.diseaseName = diseaseName;
}

public String getResult() {
    return result;
}

public void setResult(String result) {
    this.result = result;
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

public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
}

}
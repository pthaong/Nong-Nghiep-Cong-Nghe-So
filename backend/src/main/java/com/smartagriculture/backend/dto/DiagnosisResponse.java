package com.smartagriculture.backend.dto;

public class DiagnosisResponse {

private boolean success;

private String diseaseName;

private String severity;

private String symptoms;

private String cause;

private String treatment;

private String prevention;

private String diagnosis;

public DiagnosisResponse() {
}

public DiagnosisResponse(
        boolean success,
        String diseaseName,
        String severity,
        String symptoms,
        String cause,
        String treatment,
        String prevention,
        String diagnosis) {

    this.success = success;
    this.diseaseName = diseaseName;
    this.severity = severity;
    this.symptoms = symptoms;
    this.cause = cause;
    this.treatment = treatment;
    this.prevention = prevention;
    this.diagnosis = diagnosis;
}

public boolean isSuccess() {
    return success;
}

public void setSuccess(boolean success) {
    this.success = success;
}

public String getDiseaseName() {
    return diseaseName;
}

public void setDiseaseName(String diseaseName) {
    this.diseaseName = diseaseName;
}

public String getSeverity() {
    return severity;
}

public void setSeverity(String severity) {
    this.severity = severity;
}

public String getSymptoms() {
    return symptoms;
}

public void setSymptoms(String symptoms) {
    this.symptoms = symptoms;
}

public String getCause() {
    return cause;
}

public void setCause(String cause) {
    this.cause = cause;
}

public String getTreatment() {
    return treatment;
}

public void setTreatment(String treatment) {
    this.treatment = treatment;
}

public String getPrevention() {
    return prevention;
}

public void setPrevention(String prevention) {
    this.prevention = prevention;
}

public String getDiagnosis() {
    return diagnosis;
}

public void setDiagnosis(String diagnosis) {
    this.diagnosis = diagnosis;
}

}
package com.smartagriculture.backend.dto;

public class DiagnosisResponse {

    private String diseaseName;
    private String result;
    private String severity;
    private String cause;
    private String prevention;
    private String treatment;

    public DiagnosisResponse() {
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
}
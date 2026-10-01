package com.smartagriculture.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PlantRequest {

    @NotBlank(message = "Tên cây không được để trống")
    @Size(max = 255, message = "Tên cây tối đa 255 ký tự")
    private String name;

    @NotBlank(message = "Loại cây không được để trống")
    @Size(max = 255, message = "Loại cây tối đa 255 ký tự")
    private String plantType;

    @Size(max = 255, message = "Giống cây tối đa 255 ký tự")
    private String variety;

    @Size(max = 255, message = "Giai đoạn sinh trưởng tối đa 255 ký tự")
    private String growthStage;

    private String description;

    public PlantRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPlantType() { return plantType; }
    public void setPlantType(String plantType) { this.plantType = plantType; }

    public String getVariety() { return variety; }
    public void setVariety(String variety) { this.variety = variety; }

    public String getGrowthStage() { return growthStage; }
    public void setGrowthStage(String growthStage) { this.growthStage = growthStage; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}

package com.smartagriculture.backend.service;

import com.smartagriculture.backend.entity.Crop;
import com.smartagriculture.backend.repository.CropRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CropService {

    private final CropRepository cropRepository;

    public CropService(CropRepository cropRepository) {
        this.cropRepository = cropRepository;
    }

    // Lấy tất cả cây trồng
    public List<Crop> getAllCrops() {
        return cropRepository.findAll();
    }

    // Lấy cây trồng theo ID
    public Crop getCropById(Long id) {
        return cropRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy cây trồng với ID: " + id));
    }

    // Tìm kiếm theo tên
    public List<Crop> searchByName(String name) {
        return cropRepository.findByNameContainingIgnoreCase(name);
    }

    // Lọc theo loại cây
    public List<Crop> findByPlantType(String plantType) {
        return cropRepository.findByPlantTypeIgnoreCase(plantType);
    }

    // Thêm cây trồng
    public Crop createCrop(Crop crop) {
        return cropRepository.save(crop);
    }

    // Cập nhật cây trồng
    public Crop updateCrop(Long id, Crop request) {

        Crop crop = getCropById(id);

        crop.setName(request.getName());
        crop.setPlantType(request.getPlantType());
        crop.setDescription(request.getDescription());
        crop.setGrowingSeason(request.getGrowingSeason());
        crop.setGrowthTime(request.getGrowthTime());
        crop.setCareGuide(request.getCareGuide());

        return cropRepository.save(crop);
    }

    // Xóa cây trồng
    public void deleteCrop(Long id) {

        if (!cropRepository.existsById(id)) {
            throw new RuntimeException(
                    "Không tìm thấy cây trồng với ID: " + id
            );
        }

        cropRepository.deleteById(id);
    }
}
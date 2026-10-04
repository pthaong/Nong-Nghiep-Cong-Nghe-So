package com.smartagriculture.backend.service;

import com.smartagriculture.backend.dto.PlantRequest;
import com.smartagriculture.backend.dto.PlantResponse;
import com.smartagriculture.backend.entity.Plant;
import com.smartagriculture.backend.entity.User;
import com.smartagriculture.backend.repository.PlantRepository;
import com.smartagriculture.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class PlantService {

    private final PlantRepository plantRepository;
    private final UserRepository userRepository;

    public PlantService(PlantRepository plantRepository, UserRepository userRepository) {
        this.plantRepository = plantRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<PlantResponse> getAll(Long farmerId) {
        requireActiveUser(farmerId);

        return plantRepository.findByUserId(farmerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }
@Transactional(readOnly = true)
public List<PlantResponse> getAllForAdmin(Long farmerId) {

    User farmer = userRepository.findById(farmerId)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy Farmer với id: " + farmerId
            ));

    if (!"user".equalsIgnoreCase(farmer.getRole())) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "User này không phải Farmer"
        );
    }

    return plantRepository.findByUserId(farmerId)
            .stream()
            .map(this::toResponse)
            .toList();
}
    @Transactional(readOnly = true)
    public PlantResponse getById(Long plantId, Long farmerId) {
        return toResponse(findOwnedPlant(plantId, farmerId));
    }

    @Transactional
    public PlantResponse create(Long farmerId, PlantRequest request) {
        User farmer = requireActiveUser(farmerId);

        Plant plant = new Plant();
        copyFields(plant, request);
        plant.setUser(farmer);

        return toResponse(plantRepository.save(plant));
    }

    @Transactional
    public PlantResponse update(Long plantId, Long farmerId, PlantRequest request) {
        Plant plant = findOwnedPlant(plantId, farmerId);
        copyFields(plant, request);

        return toResponse(plantRepository.save(plant));
    }

    @Transactional
    public void delete(Long plantId, Long farmerId) {
        Plant plant = findOwnedPlant(plantId, farmerId);
        plantRepository.delete(plant);
    }

    private User requireActiveUser(Long farmerId) {
        if (farmerId == null) {
            throw new IllegalArgumentException("Thiếu ID tài khoản nông dân");
        }

        User user = userRepository.findById(farmerId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản"));

        if (!"active".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalArgumentException("Tài khoản không hoạt động");
        }

        return user;
    }

    private Plant findOwnedPlant(Long plantId, Long farmerId) {
        requireActiveUser(farmerId);

        Plant plant = plantRepository.findById(plantId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy cây trồng"
                ));

        if (!plant.getUser().getId().equals(farmerId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Cây trồng không thuộc tài khoản này"
            );
        }

        return plant;
    }

    private void copyFields(Plant plant, PlantRequest request) {
        plant.setName(request.getName().trim());
        plant.setPlantType(request.getPlantType().trim());
        plant.setVariety(request.getVariety());
        plant.setGrowthStage(request.getGrowthStage());
        plant.setDescription(request.getDescription());
    }

    private PlantResponse toResponse(Plant plant) {
        PlantResponse response = new PlantResponse();

        response.setId(plant.getId());
        response.setName(plant.getName());
        response.setPlantType(plant.getPlantType());
        response.setVariety(plant.getVariety());
        response.setGrowthStage(plant.getGrowthStage());
        response.setDescription(plant.getDescription());
        response.setCreatedAt(plant.getCreatedAt());

        if (plant.getUser() != null) {
            response.setUserId(plant.getUser().getId());
        }

        return response;
    }
}

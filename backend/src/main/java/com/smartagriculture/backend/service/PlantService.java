package com.smartagriculture.backend.service;

import com.smartagriculture.backend.dto.PlantRequest;
import com.smartagriculture.backend.dto.PlantResponse;
import com.smartagriculture.backend.entity.Plant;
import com.smartagriculture.backend.entity.User;
import com.smartagriculture.backend.repository.PlantRepository;
import com.smartagriculture.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlantService {

    private final PlantRepository plantRepository;
    private final UserRepository userRepository;

    public PlantService(
            PlantRepository plantRepository,
            UserRepository userRepository) {

        this.plantRepository = plantRepository;
        this.userRepository = userRepository;
    }

    // =========================
    // GET ALL
    // =========================
    public List<PlantResponse> getAll() {

        return plantRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================
    // GET BY USER
    // =========================
    public List<PlantResponse> getByUser(Long userId) {

        checkUser(userId);

        return plantRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================
    // GET DETAIL
    // =========================
    public PlantResponse getById(Long id) {

        Plant plant = plantRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Không tìm thấy cây trồng với id: " + id
                        )
                );

        return toResponse(plant);
    }

    // =========================
    // CREATE
    // =========================
    public PlantResponse create(PlantRequest request) {

        validate(request);

        User user = checkUser(request.getUserId());

        Plant plant = new Plant();

        plant.setName(request.getName());
        plant.setPlantType(request.getPlantType());
        plant.setVariety(request.getVariety());
        plant.setGrowthStage(request.getGrowthStage());
        plant.setDescription(request.getDescription());
        plant.setUser(user);

        return toResponse(
                plantRepository.save(plant)
        );
    }

    // =========================
    // UPDATE
    // =========================
    public PlantResponse update(
            Long id,
            PlantRequest request) {

        validate(request);

        Plant plant = plantRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Không tìm thấy cây trồng với id: " + id
                        )
                );

        User user = checkUser(request.getUserId());

        plant.setName(request.getName());
        plant.setPlantType(request.getPlantType());
        plant.setVariety(request.getVariety());
        plant.setGrowthStage(request.getGrowthStage());
        plant.setDescription(request.getDescription());
        plant.setUser(user);

        return toResponse(
                plantRepository.save(plant)
        );
    }

    // =========================
    // DELETE
    // =========================
    public void delete(Long id) {

        if (!plantRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "Không tìm thấy cây trồng với id: " + id
            );
        }

        plantRepository.deleteById(id);
    }

    // =========================
    // VALIDATE
    // =========================
    private void validate(PlantRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Dữ liệu cây trồng không được để trống."
            );
        }

        if (request.getName() == null
                || request.getName().isBlank()) {

            throw new IllegalArgumentException(
                    "Tên cây không được để trống."
            );
        }

        if (request.getPlantType() == null
                || request.getPlantType().isBlank()) {

            throw new IllegalArgumentException(
                    "Loại cây không được để trống."
            );
        }

        if (request.getUserId() == null) {

            throw new IllegalArgumentException(
                    "userId không được để trống."
            );
        }
    }

    private User checkUser(Long userId) {

        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Không tìm thấy user với id: " + userId
                        )
                );
    }

    // =========================
    // CONVERT
    // =========================
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
            response.setUserId(
                    plant.getUser().getId()
            );
        }

        return response;
    }
}
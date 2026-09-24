package com.smartagriculture.backend.service;

import com.smartagriculture.backend.dto.ProfileResponse;
import com.smartagriculture.backend.dto.UpdateProfileRequest;
import com.smartagriculture.backend.entity.User;
import com.smartagriculture.backend.repository.UserRepository;

import org.springframework.stereotype.Service;

@Service
public class ProfileService {

    private final UserRepository userRepository;

    public ProfileService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // =========================
    // GET PROFILE
    // =========================
    public ProfileResponse getProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        return toResponse(user);
    }

    // =========================
    // UPDATE PROFILE
    // =========================
    public ProfileResponse updateProfile(
            String email,
            UpdateProfileRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        user.setName(request.getName());
        user.setPhone(request.getPhone());

        User savedUser = userRepository.save(user);

        return toResponse(savedUser);
    }

    // =========================
    // ENTITY -> RESPONSE
    // =========================
    private ProfileResponse toResponse(User user) {

        return new ProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getStatus()
        );
    }
}
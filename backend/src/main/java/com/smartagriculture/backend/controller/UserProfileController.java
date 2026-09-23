package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.dto.ProfileResponse;
import com.smartagriculture.backend.dto.UpdateProfileRequest;
import com.smartagriculture.backend.service.ProfileService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {

    private final ProfileService profileService;

    public UserProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    // =========================
    // GET PROFILE
    // GET /api/users/profile?email=...
    // =========================
    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getProfile(
            @RequestParam String email) {

        ProfileResponse response =
                profileService.getProfile(email);

        return ResponseEntity.ok(response);
    }

    // =========================
    // UPDATE PROFILE
    // PUT /api/users/profile?email=...
    // =========================
    @PutMapping("/profile")
    public ResponseEntity<ProfileResponse> updateProfile(
            @RequestParam String email,
            @Valid @RequestBody UpdateProfileRequest request) {

        ProfileResponse response =
                profileService.updateProfile(email, request);

        return ResponseEntity.ok(response);
    }
}
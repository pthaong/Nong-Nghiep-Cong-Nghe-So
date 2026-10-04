package com.smartagriculture.backend.service;

import com.smartagriculture.backend.dto.AdminUserResponse;
import com.smartagriculture.backend.entity.User;
import com.smartagriculture.backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AdminUserService {

    private final UserRepository userRepository;

    public AdminUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ==========================================
    // 1. LẤY DANH SÁCH FARMER
    // GET /api/admin/users/farmers
    // ==========================================
    public List<AdminUserResponse> getAllFarmers() {

        return userRepository
                .findByRoleIgnoreCase("user")
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ==========================================
    // 2. TÌM KIẾM FARMER
    // GET /api/admin/users/farmers/search?keyword=...
    // ==========================================
   public List<AdminUserResponse> searchFarmers(String keyword) {

    if (keyword == null || keyword.isBlank()) {
        return getAllFarmers();
    }

    String searchKeyword = keyword.trim();

    return userRepository
            .findByRoleIgnoreCaseAndNameContainingIgnoreCaseOrRoleIgnoreCaseAndPhoneContaining(
                    "user",
                    searchKeyword,
                    "user",
                    searchKeyword
            )
            .stream()
            .map(this::toResponse)
            .toList();
}

    // ==========================================
    // 3. KHÓA FARMER
    // ==========================================
    public AdminUserResponse lockFarmer(Long id) {

        User user = findFarmer(id);

        user.setStatus("LOCKED");

        User savedUser = userRepository.save(user);

        return toResponse(savedUser);
    }

    // ==========================================
    // 4. MỞ KHÓA FARMER
    // ==========================================
    public AdminUserResponse unlockFarmer(Long id) {

        User user = findFarmer(id);

        user.setStatus("ACTIVE");

        User savedUser = userRepository.save(user);

        return toResponse(savedUser);
    }

    // ==========================================
    // 5. XÓA FARMER
    // ==========================================
    public void deleteFarmer(Long id) {

        User user = findFarmer(id);

        userRepository.delete(user);
    }

    // ==========================================
    // TÌM FARMER THEO ID
    // ==========================================
    private User findFarmer(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Không tìm thấy User với id: " + id
                        )
                );

        if (!"user".equalsIgnoreCase(user.getRole())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "User này không phải Farmer"
            );
        }

        return user;
    }

    // ==========================================
    // ENTITY → RESPONSE
    // ==========================================
    private AdminUserResponse toResponse(User user) {

        return new AdminUserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getStatus()
        );
    }
}
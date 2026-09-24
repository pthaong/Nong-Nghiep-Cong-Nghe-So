package com.smartagriculture.backend.service;

import com.smartagriculture.backend.dto.LoginRequest;
import com.smartagriculture.backend.dto.LoginResponse;
import com.smartagriculture.backend.dto.RegisterRequest;
import com.smartagriculture.backend.dto.RegisterResponse;
import com.smartagriculture.backend.entity.User;
import com.smartagriculture.backend.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =========================
    // REGISTER
    // =========================
    public RegisterResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());

        // Không lưu password dạng plain text
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setRole("user");
        user.setStatus("active");

        User savedUser = userRepository.save(user);

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
    }

    // =========================
    // LOGIN
    // =========================
    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new IllegalArgumentException("Invalid email or password")
                );

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new IllegalArgumentException("Invalid email or password");
        }

        if (!"active".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalArgumentException("User account is not active");
        }

        return new LoginResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }
}
package com.smartagriculture.backend.controller;

import com.smartagriculture.backend.dto.LoginRequest;
import com.smartagriculture.backend.dto.LoginResponse;
import com.smartagriculture.backend.dto.RegisterRequest;
import com.smartagriculture.backend.dto.RegisterResponse;
import com.smartagriculture.backend.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(
    origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    }
)
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // =========================
    // REGISTER
    // POST /api/auth/register
    // =========================
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        RegisterResponse response = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =========================
    // LOGIN
    // POST /api/auth/login
    // =========================
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }
}
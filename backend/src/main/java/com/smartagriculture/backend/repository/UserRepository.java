package com.smartagriculture.backend.repository;

import com.smartagriculture.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRoleIgnoreCase(String role);

    List<User> findByRoleIgnoreCaseAndNameContainingIgnoreCase(
            String role,
            String name
    );
}
package com.smartagriculture.backend.repository;

import com.smartagriculture.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // Admin: lấy danh sách Farmer
    List<User> findByRoleIgnoreCase(String role);

    // Admin: tìm Farmer theo tên hoặc số điện thoại
    List<User> findByRoleIgnoreCaseAndNameContainingIgnoreCaseOrRoleIgnoreCaseAndPhoneContaining(
            String roleForName,
            String name,
            String roleForPhone,
            String phone
    );
}
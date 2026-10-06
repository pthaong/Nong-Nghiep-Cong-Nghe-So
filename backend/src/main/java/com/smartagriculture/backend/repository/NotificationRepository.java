package com.smartagriculture.backend.repository;

import com.smartagriculture.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    // Lấy thông báo của một người dùng, mới nhất trước
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Lấy thông báo chưa đọc
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    // Đếm thông báo chưa đọc
    long countByUserIdAndIsReadFalse(Long userId);
    // Admin lấy tất cả thông báo, mới nhất trước
    List<Notification> findAllByOrderByCreatedAtDesc();
}
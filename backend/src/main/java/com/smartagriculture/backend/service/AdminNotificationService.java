package com.smartagriculture.backend.service;

import com.smartagriculture.backend.dto.AdminNotificationResponse;
import com.smartagriculture.backend.entity.Notification;
import com.smartagriculture.backend.repository.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AdminNotificationService {

    private final NotificationRepository notificationRepository;

    public AdminNotificationService(
            NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // Admin xem tất cả thông báo
    public List<AdminNotificationResponse> getAll() {
        return notificationRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(AdminNotificationResponse::new)
                .toList();
    }

    // Admin xem thông báo theo ID
    public AdminNotificationResponse getById(Long id) {

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Không tìm thấy thông báo"
                        )
                );

        return new AdminNotificationResponse(notification);
    }

    // Admin tạo thông báo
    public AdminNotificationResponse create(Notification notification) {

        if (notification == null) {
            throw new IllegalArgumentException(
                    "Dữ liệu thông báo không được để trống"
            );
        }

        if (notification.getUserId() == null) {
            throw new IllegalArgumentException(
                    "User ID không được để trống"
            );
        }

        notification.setId(null);
        notification.setIsRead(false);

        Notification saved = notificationRepository.save(notification);

        return new AdminNotificationResponse(saved);
    }

    // Admin xóa thông báo
    public void delete(Long id) {

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Không tìm thấy thông báo"
                        )
                );

        notificationRepository.delete(notification);
    }
}
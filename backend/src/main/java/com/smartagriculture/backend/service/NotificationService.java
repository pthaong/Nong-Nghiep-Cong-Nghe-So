package com.smartagriculture.backend.service;

import com.smartagriculture.backend.entity.Notification;
import com.smartagriculture.backend.repository.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(
            NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // Lấy tất cả thông báo của user
    public List<Notification> getByUserId(Long userId) {

        if (userId == null) {
            throw new IllegalArgumentException(
                    "User ID không được để trống."
            );
        }

        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Lấy thông báo chưa đọc
    public List<Notification> getUnread(Long userId) {

        return notificationRepository
                .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
    }

    // Đếm thông báo chưa đọc
    public long countUnread(Long userId) {

        return notificationRepository
                .countByUserIdAndIsReadFalse(userId);
    }

    // Xem chi tiết
    public Notification getById(Long id) {

        return notificationRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Không tìm thấy thông báo với ID: " + id
                        )
                );
    }

    // Tạo thông báo
    public Notification create(Notification notification) {

        if (notification == null) {
            throw new IllegalArgumentException(
                    "Dữ liệu thông báo không được để trống."
            );
        }

        if (notification.getUserId() == null) {
            throw new IllegalArgumentException(
                    "User ID không được để trống."
            );
        }

        notification.setId(null);
        notification.setIsRead(false);

        return notificationRepository.save(notification);
    }

    // Đánh dấu một thông báo đã đọc
    public Notification markAsRead(Long id) {

        Notification notification = getById(id);

        notification.setIsRead(true);

        return notificationRepository.save(notification);
    }

    // Đánh dấu toàn bộ thông báo của user đã đọc
    public void markAllAsRead(Long userId) {

        List<Notification> notifications =
                notificationRepository
                        .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);

        for (Notification notification : notifications) {
            notification.setIsRead(true);
        }

        notificationRepository.saveAll(notifications);
    }

    // Xóa thông báo
    public void delete(Long id) {

        Notification notification = getById(id);

        notificationRepository.delete(notification);
    }
}
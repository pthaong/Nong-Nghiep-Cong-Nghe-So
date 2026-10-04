package com.smartagriculture.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "warnings")
public class Warning {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

// Tiêu đề cảnh báo
@NotBlank(message = "Tiêu đề cảnh báo không được để trống")
@Size(max = 255, message = "Tiêu đề cảnh báo tối đa 255 ký tự")
@Column(nullable = false, length = 255)
private String title;

// Nội dung cảnh báo
@NotBlank(message = "Nội dung cảnh báo không được để trống")
@Lob
@Column(nullable = false)
private String message;

// Loại cảnh báo
@Size(max = 100, message = "Loại cảnh báo tối đa 100 ký tự")
@Column(length = 100)
private String type;

// Mức độ cảnh báo
@NotBlank(message = "Mức độ cảnh báo không được để trống")
@Size(max = 50, message = "Mức độ cảnh báo tối đa 50 ký tự")
@Column(length = 50)
private String level;

// Khu vực áp dụng
@Size(max = 255, message = "Khu vực tối đa 255 ký tự")
@Column(length = 255)
private String area;

// Thời gian tạo
@Column(name = "created_at", nullable = false)
private LocalDateTime createdAt;

public Warning() {
}

@PrePersist
protected void onCreate() {
    if (createdAt == null) {
        createdAt = LocalDateTime.now();
    }
}

public Long getId() {
    return id;
}

public String getTitle() {
    return title;
}

public void setTitle(String title) {
    this.title = title;
}

public String getMessage() {
    return message;
}

public void setMessage(String message) {
    this.message = message;
}

public String getType() {
    return type;
}

public void setType(String type) {
    this.type = type;
}

public String getLevel() {
    return level;
}

public void setLevel(String level) {
    this.level = level;
}

public String getArea() {
    return area;
}

public void setArea(String area) {
    this.area = area;
}

public LocalDateTime getCreatedAt() {
    return createdAt;
}

}
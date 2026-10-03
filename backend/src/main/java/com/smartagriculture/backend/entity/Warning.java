package com.smartagriculture.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "warnings")
public class Warning {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

// Tiêu đề cảnh báo
@Column(nullable = false, length = 255)
private String title;

// Nội dung cảnh báo
@Lob
@Column(nullable = false)
private String message;

// Loại cảnh báo
@Column(length = 100)
private String type;

// Mức độ cảnh báo
@Column(length = 50)
private String level;

// Khu vực áp dụng
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
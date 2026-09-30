package com.smartagriculture.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "seasons")
public class Season {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tên mùa vụ không được để trống")
    @Column(nullable = false, columnDefinition = "NVARCHAR(255)")
    private String name;

    @NotBlank(message = "Tên cây trồng không được để trống")
    @Column(nullable = false, columnDefinition = "NVARCHAR(255)")
    private String crop;

    @NotNull(message = "Diện tích không được để trống")
    @DecimalMin(value = "0.01", message = "Diện tích phải lớn hơn 0")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal area;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    @Column(nullable = false)
    private LocalDate start;

   @NotNull(message = "Ngày kết thúc không được để trống")
   @Column(name = "end_date", nullable = false)
    private LocalDate end;

    @NotBlank(message = "Trạng thái không được để trống")
    @Column(nullable = false, columnDefinition = "NVARCHAR(255)")
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farmer_id", nullable = false)
    private User farmer;

    public Season() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCrop() {
        return crop;
    }

    public void setCrop(String crop) {
        this.crop = crop;
    }

    public BigDecimal getArea() {
        return area;
    }

    public void setArea(BigDecimal area) {
        this.area = area;
    }

    public LocalDate getStart() {
        return start;
    }

    public void setStart(LocalDate start) {
        this.start = start;
    }

    public LocalDate getEnd() {
        return end;
    }

    public void setEnd(LocalDate end) {
        this.end = end;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public User getFarmer() {
        return farmer;
    }

    public void setFarmer(User farmer) {
        this.farmer = farmer;
    }
}